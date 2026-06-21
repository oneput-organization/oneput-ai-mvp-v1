// GRI sector standards — maps each industry to required and recommended metric IDs.
// Universal disclosures (GRI 2 series) are always required regardless of industry.

export const UNIVERSAL_METRIC_IDS = [
  'gri-2-1',
  'gri-2-9',
  'gri-2-12',
  'gri-2-15',
  'gri-2-22',
  'gri-2-27',
  'gri-2-29',
];

// required: must collect; recommended: material but optional
export const INDUSTRY_METRIC_MAP = {
  Energy: {
    label: 'Energy',
    sectorStandard: 'GRI 11 — Oil, Gas & Coal',
    required: [
      'gri-302-1', 'gri-302-3', 'gri-302-4',
      'gri-303-3', 'gri-303-5',
      'gri-305-1', 'gri-305-2', 'gri-305-3', 'gri-305-4',
      'gri-403-9', 'gri-403-10',
    ],
    recommended: [
      'gri-306-3', 'gri-306-4',
      'gri-413-1',
      'gri-205-1', 'gri-205-3',
    ],
  },

  Materials: {
    label: 'Materials',
    sectorStandard: 'GRI 14 — Mining Sector',
    required: [
      'gri-302-1', 'gri-302-3',
      'gri-303-3', 'gri-303-5',
      'gri-305-1', 'gri-305-2', 'gri-305-3',
      'gri-306-3', 'gri-306-4',
      'gri-401-1',
      'gri-403-9', 'gri-403-10',
      'gri-413-1',
    ],
    recommended: [
      'gri-302-4', 'gri-305-4',
      'gri-205-1', 'gri-205-3',
      'gri-404-1',
    ],
  },

  Industrials: {
    label: 'Industrials',
    sectorStandard: 'GRI Universal + Topic Standards',
    required: [
      'gri-302-1', 'gri-302-4',
      'gri-305-1', 'gri-305-2', 'gri-305-3',
      'gri-306-3', 'gri-306-4',
      'gri-401-1',
      'gri-403-9', 'gri-403-10',
    ],
    recommended: [
      'gri-302-3', 'gri-305-4',
      'gri-303-3', 'gri-303-5',
      'gri-404-1', 'gri-405-1',
    ],
  },

  'Consumer Discretionary': {
    label: 'Consumer Discretionary',
    sectorStandard: 'GRI Universal + Topic Standards',
    required: [
      'gri-401-1', 'gri-401-3',
      'gri-404-1',
      'gri-405-1', 'gri-405-2',
      'gri-418-1',
    ],
    recommended: [
      'gri-413-1',
      'gri-302-1', 'gri-305-1', 'gri-305-2',
      'gri-205-1',
    ],
  },

  'Consumer Staples': {
    label: 'Consumer Staples',
    sectorStandard: 'GRI 13 — Agriculture, Aquaculture & Fishing',
    required: [
      'gri-302-1', 'gri-302-4',
      'gri-303-3', 'gri-303-5',
      'gri-305-1', 'gri-305-2', 'gri-305-3',
      'gri-306-3', 'gri-306-4',
      'gri-401-1',
      'gri-413-1',
    ],
    recommended: [
      'gri-305-4',
      'gri-403-9', 'gri-403-10',
      'gri-404-1',
      'gri-205-1',
    ],
  },

  Healthcare: {
    label: 'Healthcare',
    sectorStandard: 'GRI Universal + Topic Standards',
    required: [
      'gri-401-1', 'gri-401-3',
      'gri-403-9', 'gri-403-10',
      'gri-404-1',
      'gri-405-1',
      'gri-418-1',
    ],
    recommended: [
      'gri-405-2',
      'gri-302-1', 'gri-305-1',
      'gri-205-1',
    ],
  },

  Financials: {
    label: 'Financials',
    sectorStandard: 'GRI Universal + Topic Standards',
    required: [
      'gri-205-1', 'gri-205-3',
      'gri-206-1',
      'gri-401-1',
      'gri-405-1', 'gri-405-2',
      'gri-418-1',
    ],
    recommended: [
      'gri-413-1',
      'gri-401-3',
      'gri-404-1',
      'gri-302-1',
    ],
  },

  'Information Technology': {
    label: 'Information Technology',
    sectorStandard: 'GRI Universal + Topic Standards',
    required: [
      'gri-401-1',
      'gri-404-1',
      'gri-405-1', 'gri-405-2',
      'gri-418-1',
    ],
    recommended: [
      'gri-302-1', 'gri-302-4',
      'gri-305-1', 'gri-305-2',
      'gri-401-3',
      'gri-205-1',
    ],
  },

  'Communication Services': {
    label: 'Communication Services',
    sectorStandard: 'GRI Universal + Topic Standards',
    required: [
      'gri-401-1',
      'gri-405-1',
      'gri-418-1',
    ],
    recommended: [
      'gri-404-1', 'gri-405-2',
      'gri-302-1', 'gri-305-1',
      'gri-206-1',
    ],
  },

  Utilities: {
    label: 'Utilities',
    sectorStandard: 'GRI Universal + Topic Standards',
    required: [
      'gri-302-1', 'gri-302-3', 'gri-302-4',
      'gri-303-3', 'gri-303-5',
      'gri-305-1', 'gri-305-2', 'gri-305-3', 'gri-305-4',
      'gri-413-1',
    ],
    recommended: [
      'gri-306-3', 'gri-306-4',
      'gri-403-9', 'gri-403-10',
      'gri-401-1',
    ],
  },

  'Real Estate': {
    label: 'Real Estate',
    sectorStandard: 'GRI Universal + Topic Standards',
    required: [
      'gri-302-1', 'gri-302-3',
      'gri-303-3', 'gri-303-5',
      'gri-413-1',
      'gri-401-1',
    ],
    recommended: [
      'gri-305-1', 'gri-305-2',
      'gri-306-3',
      'gri-404-1',
      'gri-205-1',
    ],
  },

  Other: {
    label: 'Other',
    sectorStandard: 'GRI Universal Standards',
    required: [],      // all metrics active — handled as special case
    recommended: [],
  },
};

export function getMetricIdsForIndustry(industry) {
  const mapping = INDUSTRY_METRIC_MAP[industry];
  if (!mapping || industry === 'Other') return null; // null = all metrics

  const ids = new Set([
    ...UNIVERSAL_METRIC_IDS,
    ...mapping.required,
    ...mapping.recommended,
  ]);
  return [...ids];
}

export function isMetricRequired(metricId, industry) {
  if (!industry || industry === 'Other') return true;
  const mapping = INDUSTRY_METRIC_MAP[industry];
  if (!mapping) return UNIVERSAL_METRIC_IDS.includes(metricId);
  return UNIVERSAL_METRIC_IDS.includes(metricId) || mapping.required.includes(metricId);
}
