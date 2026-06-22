// API / ERP integration boundary (SAP, Oracle, etc.).
//
// MVP: this is a stub. Real connectors (and any credentials) live server-side later — keep all
// integration behind this one function so the UI never changes when the real backend arrives.
//
// Returns the same shape `bulkUpdateEntries` expects: [{ metricId, data: { value, notes, status } }].

export const API_SOURCES = [
  { id: 'sap', label: 'SAP' },
  { id: 'oracle', label: 'Oracle' },
  { id: 'erp', label: 'Other ERP / API' },
];

/**
 * Fetch metric values from an external system.
 * @param {string} sourceId - one of API_SOURCES ids
 * @param {object[]} _activeMetrics - metrics in scope (used by the real connector to map fields)
 * @returns {Promise<{ ok: boolean, configured: boolean, entries: Array, message: string }>}
 */
export async function fetchFromApi(sourceId /*, _activeMetrics */) {
  // No backend in the MVP — report "not configured" so the UI can show a clear message.
  return {
    ok: false,
    configured: false,
    entries: [],
    message: `${sourceId.toUpperCase()} integration isn't configured yet. Connect it in the backend to auto-import metrics.`,
  };
}
