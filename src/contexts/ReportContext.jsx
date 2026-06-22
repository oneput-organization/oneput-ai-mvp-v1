import { createContext, useContext, useState, useCallback } from 'react';
import { storage } from '../utils/storage';
import { useData } from './DataContext';
import { useUser } from './UserContext';
import { GRI_REPORT_TEMPLATE } from '../data/report-templates';

// Reports = instantiated templates. Sections hold rich text with {{metric:id}} variable references
// that resolve to collected values. Section + report status mirror the data-entry review lifecycle.

const ReportContext = createContext();

const newId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

export function ReportProvider({ children }) {
  const { logEvent } = useData();
  const { currentUser } = useUser();

  const [reports, setReportsState] = useState(() => storage.get('reports', []));

  // Templates: the bundled GRI template + Admin-defined custom templates.
  const [customTemplates, setCustomTemplatesState] = useState(() => storage.get('reportTemplates', []));
  const allTemplates = [GRI_REPORT_TEMPLATE, ...customTemplates];

  const addTemplate = useCallback(({ name }) => {
    const tpl = { id: `tpl-${Date.now()}`, name, framework: 'GRI', sections: [], custom: true };
    setCustomTemplatesState(prev => { const next = [...prev, tpl]; storage.set('reportTemplates', next); return next; });
    logEvent('template.create', { type: 'template', id: tpl.id }, null, name);
    return tpl;
  }, [logEvent]);

  const updateTemplate = useCallback((id, patch) => {
    setCustomTemplatesState(prev => { const next = prev.map(t => (t.id === id ? { ...t, ...patch } : t)); storage.set('reportTemplates', next); return next; });
    logEvent('template.update', { type: 'template', id }, null, null);
  }, [logEvent]);

  const deleteTemplate = useCallback((id) => {
    setCustomTemplatesState(prev => { const next = prev.filter(t => t.id !== id); storage.set('reportTemplates', next); return next; });
    logEvent('template.delete', { type: 'template', id }, null, null);
  }, [logEvent]);

  const persist = useCallback((next) => {
    setReportsState(next);
    storage.set('reports', next);
  }, []);

  // Instantiate a template into a draft report.
  const generateReport = useCallback((template = GRI_REPORT_TEMPLATE) => {
    const report = {
      id: newId('report'),
      name: `${template.name} — ${new Date().getFullYear()}`,
      templateId: template.id,
      framework: template.framework,
      status: 'draft',
      sections: template.sections.map(s => ({
        id: newId('sec'),
        title: s.title,
        body: s.boilerplate,
        status: 'draft',
        requiredMetricIds: s.requiredMetricIds || [],
        comments: [],
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setReportsState(prev => {
      const next = [...prev, report];
      storage.set('reports', next);
      return next;
    });
    logEvent('report.generate', { type: 'report', id: report.id }, null, report.name);
    return report;
  }, [logEvent]);

  const mutateReport = useCallback((reportId, fn) => {
    setReportsState(prev => {
      const next = prev.map(r => (r.id === reportId ? { ...fn(r), updatedAt: new Date().toISOString() } : r));
      storage.set('reports', next);
      return next;
    });
  }, []);

  const updateSection = useCallback((reportId, sectionId, body) => {
    mutateReport(reportId, r => ({
      ...r,
      sections: r.sections.map(s => (s.id === sectionId ? { ...s, body } : s)),
    }));
    logEvent('report.section.update', { type: 'report', id: reportId }, null, sectionId);
  }, [mutateReport, logEvent]);

  const setSectionStatus = useCallback((reportId, sectionId, status) => {
    let before = 'draft';
    mutateReport(reportId, r => ({
      ...r,
      sections: r.sections.map(s => {
        if (s.id !== sectionId) return s;
        before = s.status;
        return { ...s, status };
      }),
    }));
    logEvent('report.section.status', { type: 'report', id: reportId }, before, status);
  }, [mutateReport, logEvent]);

  const addSectionComment = useCallback((reportId, sectionId, text) => {
    mutateReport(reportId, r => ({
      ...r,
      sections: r.sections.map(s => (s.id === sectionId
        ? { ...s, comments: [...(s.comments || []), { id: newId('cmt'), text, author: currentUser?.name || 'Unknown', createdAt: new Date().toISOString() }] }
        : s)),
    }));
    logEvent('report.comment', { type: 'report', id: reportId }, null, text);
  }, [mutateReport, currentUser, logEvent]);

  const setReportStatus = useCallback((reportId, status) => {
    let before = 'draft';
    mutateReport(reportId, r => { before = r.status; return { ...r, status }; });
    logEvent('report.status', { type: 'report', id: reportId }, before, status);
  }, [mutateReport, logEvent]);

  const deleteReport = useCallback((reportId) => {
    persist(reports.filter(r => r.id !== reportId));
    logEvent('report.delete', { type: 'report', id: reportId }, null, null);
  }, [reports, persist, logEvent]);

  return (
    <ReportContext.Provider value={{
      reports,
      allTemplates,
      customTemplates,
      addTemplate,
      updateTemplate,
      deleteTemplate,
      generateReport,
      updateSection,
      setSectionStatus,
      addSectionComment,
      setReportStatus,
      deleteReport,
    }}>
      {children}
    </ReportContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useReports = () => useContext(ReportContext);
