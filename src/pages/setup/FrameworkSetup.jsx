import { useApp } from '../../contexts/AppContext';
import { GRI_FRAMEWORK } from '../../data/gri-metrics';
import { CheckCircle2, ExternalLink, Lock } from 'lucide-react';

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

export default function FrameworkSetup() {
  const { settings, setSettings } = useApp();
  const selected = settings.framework;

  const handleSelect = (fw) => {
    if (!fw.available) return;
    setSettings({
      framework: selected === fw.id ? null : fw.id,
    });
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Reporting Framework</h1>
          <p>Select the sustainability reporting framework for your organization.</p>
        </div>
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
            <div
              className="framework-card-icon"
              style={{ background: `${fw.color}15`, color: fw.color }}
            >
              {fw.icon}
            </div>
            <h3>{fw.name}</h3>
            <p style={{ marginBottom: 'var(--space-3)' }}>{fw.description}</p>
            <span className="badge badge-gray">Version {fw.version}</span>
          </div>
        ))}
      </div>

      {/* Active framework details */}
      {selected === 'gri-2021' && (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
          <div className="card-header">
            <h3 className="card-title">GRI Standards 2021 — Configuration</h3>
            <a
              href={GRI_FRAMEWORK.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              Learn More <ExternalLink size={14} />
            </a>
          </div>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--neutral-600)', marginBottom: 'var(--space-4)' }}>
            {GRI_FRAMEWORK.description}
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            {GRI_FRAMEWORK.categories.map(cat => (
              <span key={cat} className={`badge badge-${cat === 'Environmental' ? 'env' : cat === 'Social' ? 'social' : 'gov'}`}>
                {cat}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 'var(--space-5)', padding: 'var(--space-4)', background: 'var(--success-50)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <CheckCircle2 size={20} style={{ color: 'var(--success-600)' }} />
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--success-700)', fontWeight: 500 }}>
              GRI Standards 2021 is active. 30 key disclosures have been loaded into your metrics registry.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
