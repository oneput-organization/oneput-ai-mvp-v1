import { createContext, useContext, useState, useCallback } from 'react';
import { storage } from '../utils/storage';
import { GRI_METRICS } from '../data/gri-metrics';
import { getMetricIdsForIndustry, isMetricRequired } from '../data/gri-industry-mapping';
import { useApp } from './AppContext';

const DataContext = createContext();

export function DataProvider({ children }) {
  const { company } = useApp();

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
    const ids = active ? GRI_METRICS.map(m => m.id) : [];
    setActiveMetricIds(ids);
  };

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
            author: 'Admin',
            createdAt: new Date().toISOString(),
          }],
          updatedAt: new Date().toISOString(),
        },
      };
      storage.set('dataEntries', updated);
      return updated;
    });
  }, []);

  const applyIndustryMetrics = useCallback((industry) => {
    const ids = getMetricIdsForIndustry(industry) ?? GRI_METRICS.map(m => m.id);
    setActiveMetricIds(ids);
  }, []);

  // Computed stats
  const activeMetrics = GRI_METRICS.filter(m => activeMetricIds.includes(m.id)).map(m => ({
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
      activeMetrics,
      dataEntries,
      updateDataEntry,
      bulkUpdateEntries,
      addComment,
      stats,
      completionPercent,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
