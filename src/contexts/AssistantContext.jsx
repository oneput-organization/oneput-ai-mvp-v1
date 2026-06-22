import { createContext, useContext, useState, useCallback } from 'react';
import { storage } from '../utils/storage';
import { useData } from './DataContext';
import { useUser } from './UserContext';
import { notify } from '../services/assistant';

// Data-chasing state for Oneput AI: per-owner data requests + an activity log of
// (simulated) nudges and escalations. Real scheduling/sending is server-side; here
// the schedule is run on demand and sends resolve through notify() (LINE first).

const AssistantContext = createContext();

const DEFAULT_CHANNEL = 'LINE';

export function AssistantProvider({ children }) {
  const { activeMetrics, dataEntries, logEvent } = useData();
  const { users } = useUser();

  const [dataRequests, setDataRequestsState] = useState(() => storage.get('dataRequests', []));
  const [activityLog, setActivityLogState] = useState(() => storage.get('assistantLog', []));

  const setDataRequests = useCallback((next) => {
    setDataRequestsState(next);
    storage.set('dataRequests', next);
  }, []);

  const appendLog = useCallback((entry) => {
    setActivityLogState(prev => {
      const next = [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, ts: new Date().toISOString(), ...entry }];
      storage.set('assistantLog', next);
      return next;
    });
  }, []);

  const ownerName = useCallback((id) => users.find(u => u.id === id)?.name || 'Unknown', [users]);

  // Metrics an owner still owes (assigned to them and not yet approved).
  const pendingForOwner = useCallback((ownerId) =>
    activeMetrics.filter(m => dataEntries[m.id]?.assignee === ownerId && dataEntries[m.id]?.status !== 'approved'),
  [activeMetrics, dataEntries]);

  // Plan: one DataRequest per owner who has assigned-but-unapproved metrics.
  const planRequests = useCallback((dueDate) => {
    const byOwner = {};
    activeMetrics.forEach(m => {
      const owner = dataEntries[m.id]?.assignee;
      if (!owner) return;
      if (dataEntries[m.id]?.status === 'approved') return;
      (byOwner[owner] ||= []).push(m.id);
    });

    const requests = Object.entries(byOwner).map(([ownerId, metricIds]) => ({
      id: `req-${ownerId}-${Date.now()}`,
      ownerId,
      metricIds,
      dueDate: dueDate || '',
      createdAt: new Date().toISOString(),
    }));

    setDataRequests(requests);
    requests.forEach(r => {
      appendLog({ kind: 'request', ownerId: r.ownerId, text: `Requested ${r.metricIds.length} metric(s) from ${ownerName(r.ownerId)}${r.dueDate ? ` (due ${r.dueDate})` : ''}.` });
      logEvent('chase.request', { type: 'user', id: r.ownerId }, null, `${r.metricIds.length} metrics`);
    });
    return requests;
  }, [activeMetrics, dataEntries, setDataRequests, appendLog, ownerName, logEvent]);

  const sendNudge = useCallback(async (ownerId) => {
    const pending = pendingForOwner(ownerId);
    const msg = `Reminder: please submit ${pending.length} ESG metric(s) for the current reporting period.`;
    const res = await notify(DEFAULT_CHANNEL, ownerName(ownerId), msg);
    appendLog({ kind: 'nudge', ownerId, text: `${res.simulated ? '[simulated] ' : ''}Nudged ${ownerName(ownerId)} via ${DEFAULT_CHANNEL}: ${pending.length} metric(s) outstanding.` });
    logEvent('chase.nudge', { type: 'user', id: ownerId }, null, msg);
  }, [pendingForOwner, ownerName, appendLog, logEvent]);

  const escalate = useCallback(async (ownerId) => {
    const msg = `Escalation: ${ownerName(ownerId)} has overdue ESG data. Please follow up.`;
    const res = await notify(DEFAULT_CHANNEL, `Manager of ${ownerName(ownerId)}`, msg);
    appendLog({ kind: 'escalate', ownerId, text: `${res.simulated ? '[simulated] ' : ''}Escalated ${ownerName(ownerId)}'s overdue items to their manager.` });
    logEvent('chase.escalate', { type: 'user', id: ownerId }, null, msg);
  }, [ownerName, appendLog, logEvent]);

  // Run the (simulated) schedule once: nudge open requests, escalate overdue ones,
  // and drop requests whose metrics are all approved.
  const runChase = useCallback(async () => {
    const now = Date.now();
    for (const r of dataRequests) {
      const pending = pendingForOwner(r.ownerId);
      if (pending.length === 0) continue; // completed — stop chasing
      const overdue = r.dueDate && new Date(r.dueDate).getTime() < now;
      if (overdue) await escalate(r.ownerId);
      else await sendNudge(r.ownerId);
    }
    // Prune completed requests.
    setDataRequests(dataRequests.filter(r => pendingForOwner(r.ownerId).length > 0));
  }, [dataRequests, pendingForOwner, escalate, sendNudge, setDataRequests]);

  const clearLog = useCallback(() => { setActivityLogState([]); storage.set('assistantLog', []); }, []);

  return (
    <AssistantContext.Provider value={{
      dataRequests,
      activityLog,
      ownerName,
      pendingForOwner,
      planRequests,
      sendNudge,
      escalate,
      runChase,
      clearLog,
    }}>
      {children}
    </AssistantContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAssistant = () => useContext(AssistantContext);
