import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useData } from '../../contexts/DataContext';
import { GRI_METRICS } from '../../data/gri-metrics';
import { INDUSTRY_METRIC_MAP, UNIVERSAL_METRIC_IDS, getMetricIdsForIndustry } from '../../data/gri-industry-mapping';
import {
  Building2, Settings, CheckCircle2, ArrowRight, ArrowLeft,
  Sparkles, Lock, ExternalLink,
} from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Company Profile', icon: Building2 },
  { id: 2, label: 'Framework', icon: Settings },
  { id: 3, label: 'Confirm Metrics', icon: CheckCircle2 },
];

const industries = [
  'Energy', 'Materials', 'Industrials', 'Consumer Discretionary',
  'Consumer Staples', 'Healthcare', 'Financials', 'Information Technology',
  'Communication Services', 'Utilities', 'Real Estate', 'Other',
];

const revRanges = ['Under $1M', '$1M - $10M', '$10M - $100M', '$100M - $1B', 'Over $1B'];

const countries = [
  'Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Vietnam',
  'Philippines', 'Japan', 'South Korea', 'China', 'India',
  'United States', 'United Kingdom', 'Germany', 'Australia', 'Other',
];

const frameworks = [
  {
    id: 'gri-2021',
    name: 'GRI Standards',
    version: '2021',
    icon: 'G',
    color: '#16a34a',
    description: 'The most widely used sustainability reporting standards globally. Report on impacts to economy, environment, and people.',
    available: true,
  },
  {
    id: 'ifrs-s1',
    name: 'IFRS S1',
    version: '2023',
    icon: 'S1',
    color: '#0448f9',
    description: 'General requirements for disclosure of sustainability-related financial information.',
    available: false,
  },
  {
    id: 'ifrs-s2',
    name: 'IFRS S2',
    version: '2023',
    icon: 'S2',
    color: '#7c3aed',
    description: 'Climate-related disclosures including physical and transition risks.',
    available: false,
  },
  {
    id: 'sec-56-1',
    name: 'SEC 56-1',
    version: '2024',
    icon: '56',
    color: '#d97706',
    description: 'Thai SEC annual disclosure form requiring ESG information for listed companies.',
    available: false,
  },
];

function StepIndicator({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 'var(--space-10)' }}>
      {STEPS.map((step, i) => {
        const done = current > step.id;
        const active = current === step.id;
        const Icon = step.icon;
        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'var(--success-500)' : active ? 'var(--primary-500)' : 'var(--neutral-200)',
                color: done || active ? '#fff' : 'var(--neutral-500)',
                fontWeight: 700, fontSize: 'var(--font-sm)',
                transition: 'all 0.2s',
              }}>
                {done ? <CheckCircle2 size={18} /> : <Icon size={18} />}
              </div>
              <span style={{
                fontSize: 'var(--font-xs)', fontWeight: active ? 700 : 500,
                color: active ? 'var(--primary-600)' : done ? 'var(--success-600)' : 'var(--neutral-400)',
                whiteSpace: 'nowrap',
              }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: 80, height: 2, margin: '0 var(--space-2)', marginBottom: 20,
                background: done ? 'var(--success-400)' : 'var(--neutral-200)',
                transition: 'background 0.2s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Company Profile ──────────────────────────────────────────────────

function Step1({ onNext }) {
  const { company, setCompany, isCompanyComplete } = useApp();

  const handleChange = (field, value) => setCompany({ [field]: value });

  const requiredFilled =
    company.name && company.industry && company.employeeCount &&
    company.revenueRange && company.reportingPeriodStart &&
    company.reportingPeriodEnd && company.country;

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ marginBottom: 'var(--space-1)' }}>Tell us about your organization</h2>
        <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--font-sm)' }}>
          This information determines which GRI disclosures apply to your industry.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
        <div className="form-group">
          <label className="form-label">Company Name *</label>
          <input className="form-input" type="text" placeholder="e.g. Acme Corporation"
            value={company.name} onChange={e => handleChange('name', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Industry *</label>
          <select className="form-select" value={company.industry} onChange={e => handleChange('industry', e.target.value)}>
            <option value="">Select industry...</option>
            {industries.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          {company.industry && INDUSTRY_METRIC_MAP[company.industry] && (
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--primary-600)', marginTop: 'var(--space-1)' }}>
              Applies {INDUSTRY_METRIC_MAP[company.industry].sectorStandard}
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Number of Employees *</label>
          <input className="form-input" type="text" placeholder="e.g. 5,000"
            value={company.employeeCount} onChange={e => handleChange('employeeCount', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Annual Revenue Range *</label>
          <select className="form-select" value={company.revenueRange} onChange={e => handleChange('revenueRange', e.target.value)}>
            <option value="">Select range...</option>
            {revRanges.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Reporting Period Start *</label>
          <input className="form-input" type="date" value={company.reportingPeriodStart}
            onChange={e => handleChange('reportingPeriodStart', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Reporting Period End *</label>
          <input className="form-input" type="date" value={company.reportingPeriodEnd}
            onChange={e => handleChange('reportingPeriodEnd', e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Country *</label>
          <select className="form-select" value={company.country} onChange={e => handleChange('country', e.target.value)}>
            <option value="">Select country...</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group" style={{ marginTop: 'var(--space-2)' }}>
        <label className="form-label">Company Description</label>
        <textarea className="form-textarea" rows={3}
          placeholder="Brief description of your organization's business activities..."
          value={company.description} onChange={e => handleChange('description', e.target.value)} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
        <button className="btn btn-primary btn-lg" disabled={!requiredFilled} onClick={onNext}>
          Next: Select Framework <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Framework Selection ──────────────────────────────────────────────

function Step2({ onNext, onBack }) {
  const { settings, setSettings } = useApp();
  const selected = settings.framework;

  const handleSelect = (fw) => {
    if (!fw.available) return;
    setSettings({ framework: fw.id });
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ marginBottom: 'var(--space-1)' }}>Select your reporting framework</h2>
        <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--font-sm)' }}>
          Choose the sustainability standard your organization will report against.
        </p>
      </div>

      <div className="framework-grid">
        {frameworks.map(fw => (
          <div
            key={fw.id}
            className={`card card-selectable framework-card ${selected === fw.id ? 'selected' : ''} ${!fw.available ? 'disabled' : ''}`}
            onClick={() => handleSelect(fw)}
          >
            <div className="framework-card-badge">
              {selected === fw.id && (
                <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={12} /> Active
                </span>
              )}
              {!fw.available && (
                <span className="badge badge-gray" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Lock size={12} /> Coming Soon
                </span>
              )}
            </div>
            <div className="framework-card-icon" style={{ background: `${fw.color}15`, color: fw.color }}>
              {fw.icon}
            </div>
            <h3>{fw.name}</h3>
            <p style={{ marginBottom: 'var(--space-3)' }}>{fw.description}</p>
            <span className="badge badge-gray">Version {fw.version}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-6)' }}>
        <button className="btn btn-ghost btn-lg" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <button className="btn btn-primary btn-lg" disabled={!selected} onClick={onNext}>
          Next: Review Metrics <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Confirm Industry Metrics ─────────────────────────────────────────

function Step3({ onBack, onFinish }) {
  const { company } = useApp();
  const { applyIndustryMetrics } = useData();
  const industry = company.industry;
  const mapping = INDUSTRY_METRIC_MAP[industry];

  const allIds = getMetricIdsForIndustry(industry) ?? GRI_METRICS.map(m => m.id);
  const allSelectedMetrics = GRI_METRICS.filter(m => allIds.includes(m.id));

  const universalMetrics = allSelectedMetrics.filter(m => UNIVERSAL_METRIC_IDS.includes(m.id));
  const requiredMetrics = allSelectedMetrics.filter(m =>
    mapping && mapping.required.includes(m.id)
  );
  const recommendedMetrics = allSelectedMetrics.filter(m =>
    mapping && mapping.recommended.includes(m.id)
  );

  const handleFinish = () => {
    applyIndustryMetrics(industry);
    onFinish();
  };

  const categoryColor = { Environmental: 'env', Social: 'social', Governance: 'gov' };

  const MetricRow = ({ metric }) => (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)',
      background: 'var(--neutral-50)', marginBottom: 'var(--space-1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span className={`badge badge-${categoryColor[metric.category] || 'gray'}`} style={{ minWidth: 20, fontSize: 10 }}>
          {metric.category[0]}
        </span>
        <div>
          <span style={{ fontWeight: 600, fontSize: 'var(--font-xs)', color: 'var(--neutral-700)' }}>{metric.code}</span>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-500)', marginLeft: 'var(--space-2)' }}>{metric.name}</span>
        </div>
      </div>
      <span style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-400)' }}>{metric.unit}</span>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ marginBottom: 'var(--space-1)' }}>Your industry metrics</h2>
        <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--font-sm)' }}>
          Based on your industry (<strong>{industry}</strong>), we've pre-selected{' '}
          <strong>{allIds.length} metrics</strong> from the GRI Standards.
          {mapping && <span> Sector reference: <em>{mapping.sectorStandard}</em>.</span>}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', maxHeight: 380, overflow: 'auto' }}>
        <div>
          <p style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
            Universal Disclosures ({universalMetrics.length})
          </p>
          {universalMetrics.map(m => <MetricRow key={m.id} metric={m} />)}
        </div>

        <div>
          {requiredMetrics.length > 0 && (
            <>
              <p style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
                Industry-Required ({requiredMetrics.length})
              </p>
              {requiredMetrics.map(m => <MetricRow key={m.id} metric={m} />)}
            </>
          )}
          {recommendedMetrics.length > 0 && (
            <>
              <p style={{ fontSize: 'var(--font-xs)', fontWeight: 700, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                Recommended ({recommendedMetrics.length})
              </p>
              {recommendedMetrics.map(m => <MetricRow key={m.id} metric={m} />)}
            </>
          )}
          {industry === 'Other' && (
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--neutral-500)' }}>
              All {allIds.length} GRI metrics have been activated for your organization.
            </p>
          )}
        </div>
      </div>

      <div style={{
        marginTop: 'var(--space-5)', padding: 'var(--space-4)',
        background: 'var(--success-50)', borderRadius: 'var(--radius-lg)',
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        border: '1px solid var(--success-100)',
      }}>
        <CheckCircle2 size={20} style={{ color: 'var(--success-600)', flexShrink: 0 }} />
        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--success-700)', fontWeight: 500 }}>
          You can add or remove individual metrics later in the Metrics Registry.
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-6)' }}>
        <button className="btn btn-ghost btn-lg" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <button className="btn btn-primary btn-lg" onClick={handleFinish}>
          <Sparkles size={18} /> Start Reporting
        </button>
      </div>
    </div>
  );
}

// ── Wizard Shell ─────────────────────────────────────────────────────────────

export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const { completeSetup, isSetupComplete } = useApp();
  const navigate = useNavigate();

  if (isSetupComplete) {
    navigate('/', { replace: true });
    return null;
  }

  const handleFinish = () => {
    completeSetup();
    navigate('/', { replace: true });
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--neutral-50)', padding: 'var(--space-6)',
    }}>
      <div style={{ width: '100%', maxWidth: 760 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
            marginBottom: 'var(--space-3)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-lg)',
              background: 'var(--primary-500)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={18} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 'var(--font-xl)', color: 'var(--neutral-900)' }}>Oneput AI</span>
          </div>
          <h1 style={{ fontSize: 'var(--font-2xl)', marginBottom: 'var(--space-2)' }}>Welcome — let's get you set up</h1>
          <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--font-sm)' }}>
            Complete these 3 steps to configure your ESG reporting workspace.
          </p>
        </div>

        <StepIndicator current={step} />

        <div className="card" style={{ padding: 'var(--space-8)' }}>
          {step === 1 && <Step1 onNext={() => setStep(2)} />}
          {step === 2 && <Step2 onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {step === 3 && <Step3 onBack={() => setStep(2)} onFinish={handleFinish} />}
        </div>
      </div>
    </div>
  );
}
