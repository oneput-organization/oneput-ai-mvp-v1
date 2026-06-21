import { useState, Fragment } from 'react';
import { GRI_METRICS, CATEGORIES } from '../../data/gri-metrics';
import { useData } from '../../contexts/DataContext';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  ToggleRight,
  Filter,
  Download,
} from 'lucide-react';

export default function MetricsRegistry() {
  const { activeMetricIds, toggleMetricActive, setAllMetricsActive } = useData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = GRI_METRICS.filter(m => {
    const matchSearch = !search ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All' || m.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const activeCount = filtered.filter(m => activeMetricIds.includes(m.id)).length;

  const categoryBadgeClass = (cat) => {
    if (cat === 'Environmental') return 'badge-env';
    if (cat === 'Social') return 'badge-social';
    return 'badge-gov';
  };

  // Group by subcategory
  const subcategories = {};
  filtered.forEach(m => {
    if (!subcategories[m.subcategory]) {
      subcategories[m.subcategory] = [];
    }
    subcategories[m.subcategory].push(m);
  });

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-text">
          <h1>ESG Metrics Registry</h1>
          <p>Browse and manage GRI 2021 disclosure metrics. Toggle metrics on/off for your organization.</p>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setAllMetricsActive(activeCount < filtered.length)}
          >
            {activeCount === filtered.length ? 'Deactivate All' : 'Activate All'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search metrics by code or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          className={`filter-chip ${categoryFilter === 'All' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('All')}
        >
          All ({GRI_METRICS.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = GRI_METRICS.filter(m => m.category === cat.key).length;
          return (
            <button
              key={cat.key}
              className={`filter-chip ${categoryFilter === cat.key ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat.key)}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--neutral-500)' }}>
          Showing {filtered.length} metrics • {activeCount} active
        </span>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>Active</th>
              <th style={{ width: 100 }}>Code</th>
              <th>Metric Name</th>
              <th style={{ width: 120 }}>Category</th>
              <th style={{ width: 100 }}>Unit</th>
              <th style={{ width: 110 }}>Subcategory</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(metric => {
              const isActive = activeMetricIds.includes(metric.id);
              const isExpanded = expandedId === metric.id;
              return (
                <Fragment key={metric.id}>
                  <tr
                    key={metric.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpandedId(isExpanded ? null : metric.id)}
                  >
                    <td onClick={e => e.stopPropagation()}>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => toggleMetricActive(metric.id)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--primary-500)', fontFamily: 'monospace' }}>
                        {metric.code}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500 }}>{metric.name}</span>
                    </td>
                    <td>
                      <span className={`badge ${categoryBadgeClass(metric.category)}`}>
                        {metric.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--neutral-500)', fontSize: 'var(--font-xs)' }}>
                        {metric.unit}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--neutral-500)', fontSize: 'var(--font-xs)' }}>
                        {metric.subcategory}
                      </span>
                    </td>
                    <td>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${metric.id}-detail`}>
                      <td colSpan={7} style={{ background: 'var(--neutral-50)', padding: 'var(--space-5)' }}>
                        <div style={{ maxWidth: 700 }}>
                          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--neutral-600)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                            {metric.description}
                          </p>
                          <div style={{ display: 'flex', gap: 'var(--space-6)', fontSize: 'var(--font-xs)' }}>
                            <div>
                              <span style={{ color: 'var(--neutral-400)', fontWeight: 600 }}>Data Type:</span>{' '}
                              <span style={{ color: 'var(--neutral-700)' }}>{metric.dataType}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--neutral-400)', fontWeight: 600 }}>Framework:</span>{' '}
                              <span className="badge badge-blue">{metric.framework.join(', ')}</span>
                            </div>
                            {metric.validationRules.min !== undefined && (
                              <div>
                                <span style={{ color: 'var(--neutral-400)', fontWeight: 600 }}>Min:</span>{' '}
                                <span style={{ color: 'var(--neutral-700)' }}>{metric.validationRules.min}</span>
                              </div>
                            )}
                            {metric.validationRules.max !== undefined && (
                              <div>
                                <span style={{ color: 'var(--neutral-400)', fontWeight: 600 }}>Max:</span>{' '}
                                <span style={{ color: 'var(--neutral-700)' }}>{metric.validationRules.max}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><Filter size={28} /></div>
          <h3>No metrics found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}

