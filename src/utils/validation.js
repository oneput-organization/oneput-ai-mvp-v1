// Validation utilities for ESG metric data entries

export function validateMetricValue(value, metric) {
  const errors = [];
  const rules = metric.validationRules || {};

  if (rules.required && (value === '' || value === null || value === undefined)) {
    errors.push('This field is required.');
    return errors;
  }

  if (metric.dataType === 'number') {
    const num = parseFloat(value);
    if (value !== '' && isNaN(num)) {
      errors.push('Must be a valid number.');
      return errors;
    }
    if (rules.min !== undefined && num < rules.min) {
      errors.push(`Minimum value is ${rules.min}.`);
    }
    if (rules.max !== undefined && num > rules.max) {
      errors.push(`Maximum value is ${rules.max}.`);
    }
  }

  if (metric.dataType === 'text') {
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`Must be at least ${rules.minLength} characters.`);
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`Must be no more than ${rules.maxLength} characters.`);
    }
  }

  return errors;
}

export function validateCSVRow(row, metrics) {
  const errors = [];
  
  if (!row.metric_code) {
    errors.push('Missing metric_code column.');
    return { valid: false, errors };
  }

  const metric = metrics.find(m => m.code === row.metric_code);
  if (!metric) {
    errors.push(`Unknown metric code: ${row.metric_code}`);
    return { valid: false, errors };
  }

  const valueErrors = validateMetricValue(row.value, metric);
  if (valueErrors.length > 0) {
    errors.push(...valueErrors.map(e => `${row.metric_code}: ${e}`));
  }

  return { valid: errors.length === 0, errors, metric };
}

export function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || '';
    });
    row._rowIndex = index + 2;
    return row;
  });

  return { headers, rows };
}

export function generateCSVTemplate(metrics) {
  const headers = ['metric_code', 'metric_name', 'value', 'unit', 'notes'];
  const rows = metrics.map(m => [
    m.code,
    `"${m.name}"`,
    '',
    m.unit,
    '',
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
