import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { storage } from '../utils/storage';
import { GRI_METRICS } from '../data/gri-metrics';
import { getMetricIdsForIndustry, isMetricRequired } from '../data/gri-industry-mapping';
import { loadGriMetrics } from '../services/griRegistry';
import { useApp } from './AppContext';
import { useUser } from './UserContext';

const DataContext = createContext();

export function DataProvider({ children }) {
  const { company } = useApp();
  const { currentUser } = useUser();

  // Active metrics — seeded from industry mapping on first load
  const [activeMetricIds, setActiveMetricIdsState] = useState(() => {
    const saved = storage.get('activeMetricIds', null);
    if (saved) return saved;
    const industryIds = getMetricIdsForIndustry(company.industry);
    return industryIds ?? GRI_METRICS.map(m => m.id);
  });

  // Data entries: { [metricId]: { value, status, notes, assignee, comments, updatedAt } }
  const [dataEntries, setDataEntriesState] = useState(
    () => storage.get('dataEntries', {})
  );

  // Append-only audit trail: { id, actor, action, target, before, after, timestamp }
  const [auditEvents, setAuditEventsState] = useState(() => storage.get('auditEvents', []));

  // Always-current view of entries so audit actions can read `before` without stale closures.
  // Synced in an effect (refs must not be written during render).
  const entriesRef = useRef(dataEntries);
  useEffect(() => { entriesRef.current = dataEntries; }, [dataEntries]);

  // GRI registry: bundled subset by default; replaced by the real standard if an API is configured.
  const [baseMetrics, setBaseMetrics] = useState(GRI_METRICS);
  const [registrySource, setRegistrySource] = useState('bundled');
  useEffect(() => {
    let active = true;
    loadGriMetrics().then(({ metrics, source }) => {
      if (!active) return;
      setBaseMetrics(metrics);
      setRegistrySource(source);
    });
    return () => { active = false; };
  }, []);

  // Admin-defined custom GRI metrics, merged with the base registry.
  const [customMetrics, setCustomMetricsState] = useState(() => storage.get('customMetrics', []));
  const allMetrics = [...baseMetrics, ...customMetrics];

  // External-auditor findings/observations, and Admin material topics (group metrics).
  const [findings, setFindingsState] = useState(() => storage.get('findings', []));
  const [materialTopics, setMaterialTopicsState] = useState(() => storage.get('materialTopics', []));

  const setActiveMetricIds = (ids) => {
    setActiveMetricIdsState(ids);
    storage.set('activeMetricIds', ids);
  };

  const toggleMetricActive = (metricId) => {
    const updated = activeMetricIds.includes(metricId)
      ? activeMetricIds.filter(id => id !== metricId)
      : [...activeMetricIds, metricId];
    setActiveMetricIds(updated);
  };

  const setAllMetricsActive = (active) => {
    const ids = active ? allMetrics.map(m => m.id) : [];
    setActiveMetricIds(ids);
  };

  // Centralized audit logging — call from data-layer actions, never from components.
  const logEvent = useCallback((action, target, before, after) => {
    setAuditEventsState(prev => {
      const next = [...prev, {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        actor: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentUser.role } : null,
        action,
        target,
        before: before ?? null,
        after: after ?? null,
        timestamp: new Date().toISOString(),
      }];
      storage.set('auditEvents', next);
      return next;
    });
  }, [currentUser]);

  const updateDataEntry = useCallback((metricId, data) => {
    setDataEntriesState(prev => {
      const updated = {
        ...prev,
        [metricId]: {
          ...(prev[metricId] || { value: '', status: 'pending', notes: '', assignee: '', comments: [] }),
          ...data,
          updatedAt: new Date().toISOString(),
        },
      };
      storage.set('dataEntries', updated);
      return updated;
    });
  }, []);

  const bulkUpdateEntries = useCallback((entries) => {
    setDataEntriesState(prev => {
      const updated = { ...prev };
      entries.forEach(({ metricId, data }) => {
        updated[metricId] = {
          ...(updated[metricId] || { value: '', status: 'pending', notes: '', assignee: '', comments: [] }),
          ...data,
          updatedAt: new Date().toISOString(),
        };
      });
      storage.set('dataEntries', updated);
      return updated;
    });
  }, []);

  // Advance an entry's status (Owner -> Reviewer -> Approved flow). Logs the transition,
  // or a plain update when the status is unchanged (e.g. saving an edit at the same status).
  const setEntryStatus = useCallback((metricId, newStatus, patch = {}) => {
    const before = entriesRef.current[metricId]?.status || 'pending';
    updateDataEntry(metricId, { ...patch, status: newStatus });
    if (before === newStatus) {
      logEvent('data.update', { type: 'metric', id: metricId }, null, null);
    } else {
      logEvent('data.status', { type: 'metric', id: metricId }, before, newStatus);
    }
  }, [updateDataEntry, logEvent]);

  // Assign a metric to an owner (userId). Logs the (re)assignment.
  const assignMetric = useCallback((metricId, userId) => {
    const before = entriesRef.current[metricId]?.assignee || null;
    updateDataEntry(metricId, { assignee: userId });
    logEvent('data.assign', { type: 'metric', id: metricId }, before, userId);
  }, [updateDataEntry, logEvent]);

  const addComment = useCallback((metricId, comment) => {
    setDataEntriesState(prev => {
      const entry = prev[metricId] || { value: '', status: 'pending', notes: '', assignee: '', comments: [] };
      const updated = {
        ...prev,
        [metricId]: {
          ...entry,
          comments: [...(entry.comments || []), {
            id: Date.now().toString(),
            text: comment,
            author: currentUser?.name || 'Unknown',
            createdAt: new Date().toISOString(),
          }],
          updatedAt: new Date().toISOString(),
        },
      };
      storage.set('dataEntries', updated);
      return updated;
    });
    logEvent('comment.add', { type: 'metric', id: metricId }, null, comment);
  }, [currentUser, logEvent]);

  const applyIndustryMetrics = useCallback((industry) => {
    const ids = getMetricIdsForIndustry(industry) ?? GRI_METRICS.map(m => m.id);
    setActiveMetricIds(ids);
  }, []);

  // ── Admin metric management (custom GRI metrics; base registry is read-only) ──
  const addMetric = useCallback((metric) => {
    const id = `custom-${Date.now()}`;
    const created = { ...metric, id, framework: ['GRI'], custom: true };
    setCustomMetricsState(prev => {
      const next = [...prev, created];
      storage.set('customMetrics', next);
      return next;
    });
    // Activate it so it shows up in collection immediately.
    setActiveMetricIdsState(prev => {
      const next = [...prev, id];
      storage.set('activeMetricIds', next);
      return next;
    });
    logEvent('metric.create', { type: 'metric', id, code: created.code }, null, created.code);
    return created;
  }, [logEvent]);

  const updateMetric = useCallback((id, patch) => {
    setCustomMetricsState(prev => {
      const next = prev.map(m => (m.id === id ? { ...m, ...patch } : m));
      storage.set('customMetrics', next);
      return next;
    });
    logEvent('metric.update', { type: 'metric', id }, null, null);
  }, [logEvent]);

  const deleteMetric = useCallback((id) => {
    setCustomMetricsState(prev => {
      const next = prev.filter(m => m.id !== id);
      storage.set('customMetrics', next);
      return next;
    });
    logEvent('metric.delete', { type: 'metric', id }, null, null);
  }, [logEvent]);

  // ── External Auditor findings / observations ──
  const addFinding = useCallback(({ text, severity = 'medium', scope = '' }) => {
    const finding = {
      id: `fnd-${Date.now()}`,
      author: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentUser.role } : null,
      text, severity, scope, status: 'open',
      createdAt: new Date().toISOString(),
    };
    setFindingsState(prev => { const next = [...prev, finding]; storage.set('findings', next); return next; });
    logEvent('finding.create', { type: 'finding', id: finding.id }, null, severity);
    return finding;
  }, [currentUser, logEvent]);

  const setFindingStatus = useCallback((id, status) => {
    setFindingsState(prev => { const next = prev.map(f => (f.id === id ? { ...f, status } : f)); storage.set('findings', next); return next; });
    logEvent('finding.status', { type: 'finding', id }, null, status);
  }, [logEvent]);

  // ── Admin material topics (group metrics) ──
  const addTopic = useCallback(({ name, description = '', metricIds = [] }) => {
    const topic = { id: `topic-${Date.now()}`, name, description, metricIds };
    setMaterialTopicsState(prev => { const next = [...prev, topic]; storage.set('materialTopics', next); return next; });
    logEvent('topic.create', { type: 'topic', id: topic.id }, null, name);
    return topic;
  }, [logEvent]);

  const updateTopic = useCallback((id, patch) => {
    setMaterialTopicsState(prev => { const next = prev.map(t => (t.id === id ? { ...t, ...patch } : t)); storage.set('materialTopics', next); return next; });
    logEvent('topic.update', { type: 'topic', id }, null, null);
  }, [logEvent]);

  const deleteTopic = useCallback((id) => {
    setMaterialTopicsState(prev => { const next = prev.filter(t => t.id !== id); storage.set('materialTopics', next); return next; });
    logEvent('topic.delete', { type: 'topic', id }, null, null);
  }, [logEvent]);

  // Computed stats
  const activeMetrics = allMetrics.filter(m => activeMetricIds.includes(m.id)).map(m => ({
    ...m,
    required: isMetricRequired(m.id, company.industry),
  }));

  const stats = {
    totalMetrics: activeMetrics.length,
    collected: activeMetrics.filter(m => {
      const entry = dataEntries[m.id];
      return entry && entry.value !== '' && entry.value !== null && entry.value !== undefined;
    }).length,
    pendingReview: activeMetrics.filter(m => {
      const entry = dataEntries[m.id];
      return entry && (entry.status === 'submitted' || entry.status === 'under-review');
    }).length,
    approved: activeMetrics.filter(m => {
      const entry = dataEntries[m.id];
      return entry && entry.status === 'approved';
    }).length,
    rejected: activeMetrics.filter(m => {
      const entry = dataEntries[m.id];
      return entry && entry.status === 'rejected';
    }).length,
  };

  const completionPercent = stats.totalMetrics > 0
    ? Math.round((stats.approved / stats.totalMetrics) * 100)
    : 0;

  return (
    <DataContext.Provider value={{
      activeMetricIds,
      toggleMetricActive,
      setAllMetricsActive,
      applyIndustryMetrics,
      allMetrics,
      customMetrics,
      registrySource,
      addMetric,
      updateMetric,
      deleteMetric,
      findings,
      addFinding,
      setFindingStatus,
      materialTopics,
      addTopic,
      updateTopic,
      deleteTopic,
      activeMetrics,
      dataEntries,
      updateDataEntry,
      bulkUpdateEntries,
      setEntryStatus,
      assignMetric,
      addComment,
      auditEvents,
      logEvent,
      stats,
      completionPercent,
    }}>
      {children}
    </DataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext);
