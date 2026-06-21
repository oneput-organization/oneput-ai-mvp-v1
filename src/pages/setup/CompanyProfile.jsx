import { useApp } from '../../contexts/AppContext';
import { Save, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const industries = [
  'Energy', 'Materials', 'Industrials', 'Consumer Discretionary',
  'Consumer Staples', 'Healthcare', 'Financials', 'Information Technology',
  'Communication Services', 'Utilities', 'Real Estate', 'Other',
];

const revRanges = [
  'Under $1M', '$1M - $10M', '$10M - $100M', '$100M - $1B', 'Over $1B',
];

const countries = [
  'Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Vietnam',
  'Philippines', 'Japan', 'South Korea', 'China', 'India',
  'United States', 'United Kingdom', 'Germany', 'Australia', 'Other',
];

export default function CompanyProfile() {
  const { company, setCompany, companyCompletion } = useApp();
  const [saved, setSaved] = useState(false);
  const completion = companyCompletion();

  const handleChange = (field, value) => {
    setCompany({ [field]: value });
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Company Profile</h1>
          <p>Provide your organization's basic information for ESG reporting.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>Profile Completion</span>
          <span style={{ fontSize: 'var(--font-sm)', fontWeight: 700, color: completion === 100 ? 'var(--success-600)' : 'var(--primary-500)' }}>{completion}%</span>
        </div>
        <div className="progress-bar">
          <div className={`progress-bar-fill ${completion === 100 ? 'green' : ''}`} style={{ width: `${completion}%` }}></div>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
          <div className="form-group">
            <label className="form-label">Company Name *</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Acme Corporation"
              value={company.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Industry *</label>
            <select
              className="form-select"
              value={company.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
            >
              <option value="">Select industry...</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Number of Employees *</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. 5,000"
              value={company.employeeCount}
              onChange={(e) => handleChange('employeeCount', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Annual Revenue Range *</label>
            <select
              className="form-select"
              value={company.revenueRange}
              onChange={(e) => handleChange('revenueRange', e.target.value)}
            >
              <option value="">Select range...</option>
              {revRanges.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Reporting Period Start *</label>
            <input
              className="form-input"
              type="date"
              value={company.reportingPeriodStart}
              onChange={(e) => handleChange('reportingPeriodStart', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reporting Period End *</label>
            <input
              className="form-input"
              type="date"
              value={company.reportingPeriodEnd}
              onChange={(e) => handleChange('reportingPeriodEnd', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Country *</label>
            <select
              className="form-select"
              value={company.country}
              onChange={(e) => handleChange('country', e.target.value)}
            >
              <option value="">Select country...</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 'var(--space-2)' }}>
          <label className="form-label">Company Description</label>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="Brief description of your organization's business activities and sustainability context..."
            value={company.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
