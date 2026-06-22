// Report templates (MVP scope: GRI only). A template is ordered sections, each with boilerplate
// prose containing variable references like {{metric:gri-305-1}} that resolve to a metric's current
// value at render/export time. Screens render from this data — keep templates here, not in pages.

import { GRI_METRICS } from './gri-metrics';

// Matches a variable reference token: {{metric:<id>}}
export const METRIC_TOKEN = /\{\{metric:([a-z0-9-]+)\}\}/gi;

export function metricById(id) {
  return GRI_METRICS.find(m => m.id === id);
}

export const GRI_REPORT_TEMPLATE = {
  id: 'gri-2021-standard',
  name: 'GRI Standards 2021 Report',
  framework: 'GRI',
  sections: [
    {
      key: 'org-profile',
      title: 'Organizational Profile',
      requiredMetricIds: ['gri-2-1', 'gri-2-22'],
      boilerplate:
        'This report has been prepared in accordance with the GRI Standards 2021.\n\n' +
        'Organizational details: {{metric:gri-2-1}}\n\n' +
        'Statement on sustainable development strategy: {{metric:gri-2-22}}',
    },
    {
      key: 'governance',
      title: 'Governance & Ethics',
      requiredMetricIds: ['gri-2-27', 'gri-205-3'],
      boilerplate:
        'During the reporting period there were {{metric:gri-2-27}} significant instances of ' +
        'non-compliance with laws and regulations, and {{metric:gri-205-3}} confirmed incidents of corruption.',
    },
    {
      key: 'environment',
      title: 'Environmental Performance',
      requiredMetricIds: ['gri-305-1', 'gri-305-2', 'gri-305-3', 'gri-302-1', 'gri-303-3'],
      boilerplate:
        'Greenhouse gas emissions: Scope 1 was {{metric:gri-305-1}}, Scope 2 was {{metric:gri-305-2}}, ' +
        'and Scope 3 was {{metric:gri-305-3}}.\n\n' +
        'Total energy consumption was {{metric:gri-302-1}} and total water withdrawal was {{metric:gri-303-3}}.',
    },
    {
      key: 'social',
      title: 'Social Performance',
      requiredMetricIds: ['gri-401-1', 'gri-403-9', 'gri-404-1', 'gri-405-1'],
      boilerplate:
        'New hires and turnover: {{metric:gri-401-1}}. Work-related injuries: {{metric:gri-403-9}}.\n\n' +
        'Average training hours per employee: {{metric:gri-404-1}}. Diversity of governance bodies and ' +
        'employees: {{metric:gri-405-1}}.',
    },
  ],
};

export const REPORT_TEMPLATES = [GRI_REPORT_TEMPLATE];
