// GRI registry source boundary. The bundled GRI_METRICS is real GRI 2021 data but a representative
// subset. Standards change yearly, so the canonical registry should come from a real source when
// available — set VITE_GRI_REGISTRY_API_URL to a backend that returns the full GRI standard. With no
// API configured (the MVP default), we use the bundled subset. This is the one seam to swap; callers
// read metrics through DataContext, never from a hard-coded import.

import { GRI_METRICS } from '../data/gri-metrics';

// Coerce an API record into the registry metric shape used across the app.
function normalize(m) {
  return {
    id: m.id ?? m.code?.toLowerCase().replace(/\s+/g, '-'),
    code: m.code,
    name: m.name,
    description: m.description || '',
    category: m.category,
    subcategory: m.subcategory || '',
    unit: m.unit || 'text',
    dataType: m.dataType || (m.unit && m.unit !== 'text' ? 'number' : 'text'),
    framework: Array.isArray(m.framework) ? m.framework : ['GRI'],
    validationRules: m.validationRules || {},
  };
}

/**
 * Load the GRI metric registry. Uses the configured API when present, else the bundled subset.
 * @returns {Promise<{ metrics: object[], source: 'api' | 'bundled' }>}
 */
export async function loadGriMetrics() {
  const url = import.meta.env?.VITE_GRI_REGISTRY_API_URL;
  if (url) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.metrics;
        if (Array.isArray(list) && list.length > 0) {
          return { metrics: list.map(normalize).filter(m => m.id && m.code), source: 'api' };
        }
      }
    } catch {
      // Network/parse failure — fall back to the bundled standard subset.
    }
  }
  return { metrics: GRI_METRICS, source: 'bundled' };
}
