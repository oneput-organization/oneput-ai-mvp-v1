// Structured form definitions for each GRI metric.
// Each entry defines the exact fields the GRI standard requires for that disclosure.
//
// field types: 'number', 'text', 'textarea', 'select', 'percent'
// computed fields are auto-calculated from other fields (read-only)
// getPrimaryValue(vals) → the single number shown in the collection table

const num = (key, label, unit, required = true, extra = {}) => ({
  key, label, unit, type: 'number', required, min: 0, ...extra,
});
const pct = (key, label, required = true) => ({
  key, label, unit: '%', type: 'percent', required, min: 0, max: 100,
});
const txt = (key, label, placeholder = '', required = false) => ({
  key, label, unit: '', type: 'text', required, placeholder,
});
const area = (key, label, placeholder = '', required = false) => ({
  key, label, unit: '', type: 'textarea', required, placeholder,
});
const sel = (key, label, options, required = true) => ({
  key, label, unit: '', type: 'select', required, options,
});

const sumFields = (vals, keys) =>
  keys.reduce((s, k) => s + (parseFloat(vals[k]) || 0), 0);

// ─── GOVERNANCE (GRI 2 series) ────────────────────────────────────────────────
// Text-only disclosures use a single textarea — no structured sub-fields needed.

// ─── GRI 2-27 ────────────────────────────────────────────────────────────────
const form227 = {
  sections: [
    {
      label: 'Non-compliance Instances',
      fields: [
        num('total_instances', 'Total instances of significant non-compliance', 'count'),
        txt('significant_fines', 'Significant fines or sanctions (describe or enter amount)', 'e.g. $50,000 fine for emission limit breach'),
      ],
    },
  ],
  getPrimaryValue: (v) => v.total_instances ?? '',
};

// ─── GRI 205-1 ───────────────────────────────────────────────────────────────
const form2051 = {
  sections: [
    {
      label: 'Operations Assessed for Corruption Risk',
      fields: [
        num('total_operations', 'Total number of operations', 'count'),
        num('assessed_operations', 'Operations assessed for corruption risks', 'count'),
      ],
    },
  ],
  computed: [
    {
      key: 'pct_assessed',
      label: 'Percentage of operations assessed',
      unit: '%',
      formula: (v) => {
        const t = parseFloat(v.total_operations);
        const a = parseFloat(v.assessed_operations);
        if (!t || !a) return '';
        return ((a / t) * 100).toFixed(1);
      },
    },
  ],
  getPrimaryValue: (v) => {
    const t = parseFloat(v.total_operations);
    const a = parseFloat(v.assessed_operations);
    if (!t || !a) return '';
    return ((a / t) * 100).toFixed(1);
  },
};

// ─── GRI 205-3 ───────────────────────────────────────────────────────────────
const form2053 = {
  sections: [
    {
      label: 'Corruption Incidents',
      fields: [
        num('confirmed_incidents', 'Total confirmed incidents of corruption', 'count'),
        num('employees_dismissed', 'Employees dismissed or disciplined', 'count', false),
        num('contracts_terminated', 'Business partner contracts terminated', 'count', false),
        num('public_legal_cases', 'Public legal cases regarding corruption', 'count', false),
      ],
    },
  ],
  getPrimaryValue: (v) => v.confirmed_incidents ?? '',
};

// ─── GRI 206-1 ───────────────────────────────────────────────────────────────
const form2061 = {
  sections: [
    {
      label: 'Anti-competitive Legal Actions',
      fields: [
        num('pending_cases', 'Pending legal actions', 'count'),
        num('completed_cases', 'Completed legal actions', 'count'),
        area('outcomes', 'Outcomes of completed cases', 'Describe outcomes, rulings, or settlements...'),
      ],
    },
  ],
  computed: [
    {
      key: 'total_cases',
      label: 'Total legal actions',
      unit: 'count',
      formula: (v) => sumFields(v, ['pending_cases', 'completed_cases']).toString(),
    },
  ],
  getPrimaryValue: (v) => {
    const total = sumFields(v, ['pending_cases', 'completed_cases']);
    return total >= 0 ? total.toString() : '';
  },
};

// ─── GRI 302-1 ───────────────────────────────────────────────────────────────
const form3021 = {
  sections: [
    {
      label: 'Fuel Consumption',
      fields: [
        num('nonrenewable_fuel', 'Non-renewable fuel consumption', 'GJ'),
        num('renewable_fuel', 'Renewable fuel consumption', 'GJ'),
      ],
    },
    {
      label: 'Purchased Energy',
      fields: [
        num('electricity', 'Electricity consumption', 'GJ'),
        num('heating', 'Heating consumption', 'GJ', false),
        num('cooling', 'Cooling consumption', 'GJ', false),
        num('steam', 'Steam consumption', 'GJ', false),
      ],
    },
  ],
  computed: [
    {
      key: 'total',
      label: 'Total energy consumption',
      unit: 'GJ',
      formula: (v) =>
        sumFields(v, ['nonrenewable_fuel', 'renewable_fuel', 'electricity', 'heating', 'cooling', 'steam']).toFixed(2),
    },
  ],
  getPrimaryValue: (v) =>
    sumFields(v, ['nonrenewable_fuel', 'renewable_fuel', 'electricity', 'heating', 'cooling', 'steam']).toFixed(2),
};

// ─── GRI 302-3 ───────────────────────────────────────────────────────────────
const form3023 = {
  sections: [
    {
      label: 'Energy Intensity',
      fields: [
        num('intensity_ratio', 'Energy intensity ratio', 'GJ/unit'),
        txt('denominator', 'Denominator metric (what "per unit" means)', 'e.g. per tonne of product, per employee, per $ revenue', true),
        txt('energy_types_included', 'Energy types included in ratio', 'e.g. Scope 1 fuel + Scope 2 electricity'),
      ],
    },
  ],
  getPrimaryValue: (v) => v.intensity_ratio ?? '',
};

// ─── GRI 302-4 ───────────────────────────────────────────────────────────────
const form3024 = {
  sections: [
    {
      label: 'Energy Reduction',
      fields: [
        num('reduction_amount', 'Energy reduction achieved', 'GJ'),
        txt('baseline_year', 'Baseline year for comparison', 'e.g. 2020', true),
        area('initiatives', 'Conservation and efficiency initiatives', 'Describe the initiatives that produced the reduction...'),
      ],
    },
  ],
  getPrimaryValue: (v) => v.reduction_amount ?? '',
};

// ─── GRI 303-3 ───────────────────────────────────────────────────────────────
const form3033 = {
  sections: [
    {
      label: 'Water Withdrawal by Source',
      fields: [
        num('surface_water', 'Surface water withdrawal', 'ML'),
        num('groundwater', 'Groundwater withdrawal', 'ML'),
        num('seawater', 'Seawater withdrawal', 'ML', false),
        num('third_party', 'Third-party water (e.g. municipal supply)', 'ML'),
      ],
    },
  ],
  computed: [
    {
      key: 'total',
      label: 'Total water withdrawal',
      unit: 'ML',
      formula: (v) =>
        sumFields(v, ['surface_water', 'groundwater', 'seawater', 'third_party']).toFixed(2),
    },
  ],
  getPrimaryValue: (v) =>
    sumFields(v, ['surface_water', 'groundwater', 'seawater', 'third_party']).toFixed(2),
};

// ─── GRI 303-5 ───────────────────────────────────────────────────────────────
const form3035 = {
  sections: [
    {
      label: 'Water Consumption',
      fields: [
        num('total_consumption', 'Total water consumption', 'ML'),
        num('water_stressed_areas', 'Water consumption in water-stressed areas', 'ML', false),
        num('change_in_storage', 'Change in water storage', 'ML', false, { helpText: 'Positive = increase in storage' }),
      ],
    },
  ],
  getPrimaryValue: (v) => v.total_consumption ?? '',
};

// ─── GRI 305-1 ───────────────────────────────────────────────────────────────
const form3051 = {
  sections: [
    {
      label: 'Scope 1 GHG Emissions',
      fields: [
        num('gross_scope1', 'Gross direct (Scope 1) GHG emissions', 'tCO₂e'),
        num('biogenic_co2', 'Biogenic CO₂ emissions (if applicable)', 'tCO₂e', false),
        sel('consolidation_approach', 'Consolidation approach', [
          'Operational control',
          'Financial control',
          'Equity share',
        ]),
        txt('gwp_source', 'GWP source used', 'e.g. IPCC Fifth Assessment Report', false),
      ],
    },
  ],
  getPrimaryValue: (v) => v.gross_scope1 ?? '',
};

// ─── GRI 305-2 ───────────────────────────────────────────────────────────────
const form3052 = {
  sections: [
    {
      label: 'Scope 2 GHG Emissions',
      fields: [
        num('location_based', 'Location-based Scope 2 GHG emissions', 'tCO₂e'),
        num('market_based', 'Market-based Scope 2 GHG emissions (if applicable)', 'tCO₂e', false),
        sel('consolidation_approach', 'Consolidation approach', [
          'Operational control',
          'Financial control',
          'Equity share',
        ]),
      ],
    },
  ],
  getPrimaryValue: (v) => v.location_based ?? '',
};

// ─── GRI 305-3 ───────────────────────────────────────────────────────────────
const form3053 = {
  sections: [
    {
      label: 'Scope 3 GHG Emissions',
      fields: [
        num('total_scope3', 'Gross other indirect (Scope 3) GHG emissions', 'tCO₂e'),
        area('categories_included', 'Scope 3 categories included',
          'List the categories calculated (e.g. Cat 1: Purchased goods, Cat 11: Use of sold products...)'),
        txt('calculation_method', 'Calculation method or standard used', 'e.g. GHG Protocol Corporate Value Chain Standard'),
      ],
    },
  ],
  getPrimaryValue: (v) => v.total_scope3 ?? '',
};

// ─── GRI 305-4 ───────────────────────────────────────────────────────────────
const form3054 = {
  sections: [
    {
      label: 'GHG Emissions Intensity',
      fields: [
        num('intensity_ratio', 'GHG emissions intensity ratio', 'tCO₂e/unit'),
        txt('denominator', 'Denominator metric', 'e.g. per tonne of product, per $ revenue', true),
        txt('emission_scopes_included', 'Emission scopes included', 'e.g. Scope 1 + Scope 2'),
      ],
    },
  ],
  getPrimaryValue: (v) => v.intensity_ratio ?? '',
};

// ─── GRI 306-3 ───────────────────────────────────────────────────────────────
const form3063 = {
  sections: [
    {
      label: 'Waste Generated',
      fields: [
        num('hazardous', 'Hazardous waste generated', 'tonnes'),
        num('non_hazardous', 'Non-hazardous waste generated', 'tonnes'),
      ],
    },
  ],
  computed: [
    {
      key: 'total',
      label: 'Total waste generated',
      unit: 'tonnes',
      formula: (v) => sumFields(v, ['hazardous', 'non_hazardous']).toFixed(2),
    },
  ],
  getPrimaryValue: (v) => sumFields(v, ['hazardous', 'non_hazardous']).toFixed(2),
};

// ─── GRI 306-4 ───────────────────────────────────────────────────────────────
const form3064 = {
  sections: [
    {
      label: 'Waste Diverted from Disposal',
      fields: [
        num('reused', 'Waste prepared for reuse', 'tonnes'),
        num('recycled', 'Waste recycled', 'tonnes'),
        num('other_recovery', 'Other recovery operations', 'tonnes', false),
      ],
    },
  ],
  computed: [
    {
      key: 'total',
      label: 'Total waste diverted from disposal',
      unit: 'tonnes',
      formula: (v) => sumFields(v, ['reused', 'recycled', 'other_recovery']).toFixed(2),
    },
  ],
  getPrimaryValue: (v) => sumFields(v, ['reused', 'recycled', 'other_recovery']).toFixed(2),
};

// ─── GRI 401-1 ───────────────────────────────────────────────────────────────
const form4011 = {
  sections: [
    {
      label: 'New Hires',
      fields: [
        num('new_hires_count', 'Total new employee hires', 'count'),
        pct('new_hire_rate', 'New hire rate'),
      ],
    },
    {
      label: 'Employee Turnover',
      fields: [
        num('turnover_count', 'Total employee turnover', 'count'),
        pct('turnover_rate', 'Turnover rate'),
      ],
    },
  ],
  getPrimaryValue: (v) => v.new_hires_count ?? '',
};

// ─── GRI 401-3 ───────────────────────────────────────────────────────────────
const form4013 = {
  sections: [
    {
      label: 'Entitlement',
      fields: [
        num('entitled_male', 'Male employees entitled to parental leave', 'count'),
        num('entitled_female', 'Female employees entitled to parental leave', 'count'),
      ],
    },
    {
      label: 'Leave Taken',
      fields: [
        num('took_leave_male', 'Male employees who took parental leave', 'count'),
        num('took_leave_female', 'Female employees who took parental leave', 'count'),
      ],
    },
    {
      label: 'Return to Work',
      fields: [
        num('returned_male', 'Male employees returned to work after leave', 'count'),
        num('returned_female', 'Female employees returned to work after leave', 'count'),
      ],
    },
  ],
  computed: [
    {
      key: 'return_rate_male',
      label: 'Male return-to-work rate',
      unit: '%',
      formula: (v) => {
        const took = parseFloat(v.took_leave_male);
        const ret = parseFloat(v.returned_male);
        if (!took) return '';
        return ((ret / took) * 100).toFixed(1);
      },
    },
    {
      key: 'return_rate_female',
      label: 'Female return-to-work rate',
      unit: '%',
      formula: (v) => {
        const took = parseFloat(v.took_leave_female);
        const ret = parseFloat(v.returned_female);
        if (!took) return '';
        return ((ret / took) * 100).toFixed(1);
      },
    },
  ],
  getPrimaryValue: (v) =>
    sumFields(v, ['took_leave_male', 'took_leave_female']).toString(),
};

// ─── GRI 403-9 ───────────────────────────────────────────────────────────────
const form4039 = {
  sections: [
    {
      label: 'Injury Counts',
      fields: [
        num('fatalities', 'Work-related fatalities', 'count'),
        num('high_consequence_injuries', 'High-consequence injuries (excl. fatalities)', 'count'),
        num('recordable_injuries', 'Recordable work-related injuries', 'count'),
      ],
    },
    {
      label: 'Exposure Data',
      fields: [
        num('hours_worked', 'Total hours worked', 'hours'),
      ],
    },
  ],
  computed: [
    {
      key: 'injury_rate',
      label: 'Recordable injury rate (per 1M hours)',
      unit: 'rate',
      formula: (v) => {
        const h = parseFloat(v.hours_worked);
        const r = parseFloat(v.recordable_injuries);
        if (!h || isNaN(r)) return '';
        return ((r / h) * 1_000_000).toFixed(2);
      },
    },
  ],
  getPrimaryValue: (v) => v.recordable_injuries ?? '',
};

// ─── GRI 403-10 ──────────────────────────────────────────────────────────────
const form40310 = {
  sections: [
    {
      label: 'Work-related Ill Health',
      fields: [
        num('recordable_cases', 'Recordable cases of work-related ill health', 'count'),
        num('fatalities_ill_health', 'Fatalities from work-related ill health', 'count'),
        area('main_types', 'Main types of work-related ill health',
          'Describe the primary categories of ill health identified (e.g. musculoskeletal, respiratory, noise-induced...)'),
      ],
    },
  ],
  getPrimaryValue: (v) => v.recordable_cases ?? '',
};

// ─── GRI 404-1 ───────────────────────────────────────────────────────────────
const form4041 = {
  sections: [
    {
      label: 'Training Hours',
      fields: [
        num('avg_hours_total', 'Average training hours per employee (all employees)', 'hours/year'),
        num('avg_hours_male', 'Average training hours — male employees', 'hours/year', false),
        num('avg_hours_female', 'Average training hours — female employees', 'hours/year', false),
      ],
    },
  ],
  getPrimaryValue: (v) => v.avg_hours_total ?? '',
};

// ─── GRI 405-1 ───────────────────────────────────────────────────────────────
const form4051 = {
  sections: [
    {
      label: 'Governance Body Diversity',
      fields: [
        pct('board_female_pct', '% female members on highest governance body'),
        pct('board_under30_pct', '% members under 30 years old'),
        pct('board_30to50_pct', '% members aged 30–50'),
        pct('board_over50_pct', '% members over 50 years old'),
      ],
    },
    {
      label: 'Employee Diversity',
      fields: [
        pct('employees_female_pct', '% female employees (all categories)'),
        pct('employees_under30_pct', '% employees under 30 years old', false),
        pct('employees_30to50_pct', '% employees aged 30–50', false),
        pct('employees_over50_pct', '% employees over 50 years old', false),
      ],
    },
  ],
  getPrimaryValue: (v) => v.employees_female_pct ?? '',
};

// ─── GRI 405-2 ───────────────────────────────────────────────────────────────
const form4052 = {
  sections: [
    {
      label: 'Pay Equity Ratios (women to men)',
      fields: [
        num('basic_salary_ratio', 'Basic salary ratio (women / men)', 'ratio', true, { max: 10, step: 0.01, helpText: '1.0 = equal; 0.9 = women earn 90% of men' }),
        num('total_remuneration_ratio', 'Total remuneration ratio (women / men)', 'ratio', true, { max: 10, step: 0.01 }),
      ],
    },
  ],
  getPrimaryValue: (v) => v.basic_salary_ratio ?? '',
};

// ─── GRI 413-1 ───────────────────────────────────────────────────────────────
const form4131 = {
  sections: [
    {
      label: 'Local Community Engagement',
      fields: [
        pct('engagement_pct', '% of operations with local community engagement programs'),
        pct('impact_assessment_pct', '% of operations with impact assessments'),
        pct('development_pct', '% of operations with development programs'),
      ],
    },
  ],
  getPrimaryValue: (v) => v.engagement_pct ?? '',
};

// ─── GRI 418-1 ───────────────────────────────────────────────────────────────
const form4181 = {
  sections: [
    {
      label: 'Customer Privacy Complaints',
      fields: [
        num('outside_complaints', 'Substantiated complaints from outside parties', 'count'),
        num('regulatory_complaints', 'Substantiated complaints from regulatory bodies', 'count'),
        num('data_breaches', 'Identified leaks, thefts, or losses of customer data', 'count'),
      ],
    },
  ],
  computed: [
    {
      key: 'total_complaints',
      label: 'Total substantiated complaints',
      unit: 'count',
      formula: (v) => sumFields(v, ['outside_complaints', 'regulatory_complaints']).toString(),
    },
  ],
  getPrimaryValue: (v) =>
    sumFields(v, ['outside_complaints', 'regulatory_complaints']).toString(),
};

// ─── REGISTRY ────────────────────────────────────────────────────────────────

export const METRIC_FORMS = {
  'gri-2-27':   form227,
  'gri-205-1':  form2051,
  'gri-205-3':  form2053,
  'gri-206-1':  form2061,
  'gri-302-1':  form3021,
  'gri-302-3':  form3023,
  'gri-302-4':  form3024,
  'gri-303-3':  form3033,
  'gri-303-5':  form3035,
  'gri-305-1':  form3051,
  'gri-305-2':  form3052,
  'gri-305-3':  form3053,
  'gri-305-4':  form3054,
  'gri-306-3':  form3063,
  'gri-306-4':  form3064,
  'gri-401-1':  form4011,
  'gri-401-3':  form4013,
  'gri-403-9':  form4039,
  'gri-403-10': form40310,
  'gri-404-1':  form4041,
  'gri-405-1':  form4051,
  'gri-405-2':  form4052,
  'gri-413-1':  form4131,
  'gri-418-1':  form4181,
};

// Parse stored value string back to field values object
export function parseMetricValue(rawValue) {
  if (!rawValue) return {};
  try {
    const parsed = JSON.parse(rawValue);
    if (typeof parsed === 'object' && parsed !== null) return parsed;
  } catch {}
  return { _raw: rawValue };
}

// Serialize field values to storage string
export function serializeMetricValue(fieldValues) {
  return JSON.stringify(fieldValues);
}

// Get human-readable display value for table column
export function getDisplayValue(metricId, rawValue, unit) {
  const form = METRIC_FORMS[metricId];
  if (!form) return rawValue || '';
  if (!rawValue) return '';
  const vals = parseMetricValue(rawValue);
  const primary = form.getPrimaryValue(vals);
  if (primary === '' || primary === null || primary === undefined) return '';
  return `${primary} ${unit}`.trim();
}

// Validate all required fields in a structured form
export function validateStructuredForm(metricId, fieldValues) {
  const form = METRIC_FORMS[metricId];
  if (!form) return [];
  const errors = {};
  form.sections.forEach(section => {
    section.fields.forEach(field => {
      const val = fieldValues[field.key];
      const isEmpty = val === '' || val === null || val === undefined;
      if (field.required && isEmpty) {
        errors[field.key] = 'This field is required.';
        return;
      }
      if (!isEmpty && (field.type === 'number' || field.type === 'percent')) {
        const num = parseFloat(val);
        if (isNaN(num)) { errors[field.key] = 'Must be a valid number.'; return; }
        if (field.min !== undefined && num < field.min) {
          errors[field.key] = `Minimum value is ${field.min}.`;
        } else if (field.max !== undefined && num > field.max) {
          errors[field.key] = `Maximum value is ${field.max}.`;
        }
      }
    });
  });
  return errors;
}
