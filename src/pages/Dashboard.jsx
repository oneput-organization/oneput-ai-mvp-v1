import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useData } from '../contexts/DataContext';
import { useUser } from '../contexts/UserContext';
import { roleLabel } from '../data/permissions';
import {
  Database,
  ClipboardCheck,
  ClipboardList,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  CalendarClock,
  FileText,
  History,
  Sparkles,
} from 'lucide-react';

export default function Dashboard() {
  const { company, settings } = useApp();
  const { stats, completionPercent, activeMetrics, dataEntries } = useData();
  const { currentUser, can } = useUser();

  const greeting = company.name
    ? `Welcome back, ${company.name}`
    : 'Welcome to Oneput AI';

  // Role-aware quick actions — show only what this role can act on.
  const quickActions = [
    { to: '/collection', icon: ClipboardCheck, label: 'Enter ESG Data', show: can('data:enter') },
    { to: '/collection', icon: ClipboardList, label: 'Review Queue', show: can('data:review') },
    { to: '/report', icon: FileText, label: 'Report Builder', show: can('report:write') || can('report:view') },
    { to: '/chasing', icon: CalendarClock, label: 'Data Chasing', show: can('data:view-all') },
    { to: '/chatbot', icon: MessageSquare, label: 'Ask Oneput AI', show: can('data:view') },
    { to: '/audit', icon: History, label: 'Audit Trail', show: can('audit:view') },
    { to: '/registry', icon: Database, label: 'Metrics Registry', show: can('data:view') },
  ].filter(a => a.show);

  // Recent activity (mock + real)
  const recentActivity = [];

  const sortedEntries = Object.entries(dataEntries)
    .filter(([, e]) => e.updatedAt)
    .sort(([, a], [, b]) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  sortedEntries.forEach(([metricId, entry]) => {
    const metric = activeMetrics.find(m => m.id === metricId);
    if (metric) {
      recentActivity.push({
        id: metricId,
        text: `${metric.code} — ${metric.name}`,
        status: entry.status,
        time: new Date(entry.updatedAt).toLocaleString(),
      });
    }
  });

  return (
    <div className="page-shell">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>{greeting}</h1>
          <p>
            You're viewing as <strong>{roleLabel(currentUser.role)}</strong>.{' '}
            {settings.framework
              ? 'Track progress across your ESG metrics.'
              : 'Get started by selecting a reporting framework and entering your company details.'}
          </p>
        </div>
      </div>

      {/* Setup prompt if not configured */}
      {!settings.framework && (
        <div className="card" style={{ marginBottom: 'var(--space-6)', background: 'linear-gradient(135deg, var(--primary-50), var(--primary-100))', borderColor: 'var(--primary-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--primary-500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: 4 }}>Get Started</h3>
              <p style={{ color: 'var(--neutral-600)', fontSize: 'var(--font-sm)' }}>
                Select GRI as your reporting framework and fill in your company profile to begin collecting ESG data.
              </p>
            </div>
            <Link to="/setup/framework" className="btn btn-primary btn-lg">
              Start Setup <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
        <div className="stat-card">
          <div className="stat-card-icon blue"><Database size={22} /></div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.totalMetrics}</div>
            <div className="stat-card-label">Active Metrics</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon purple"><TrendingUp size={22} /></div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.collected}</div>
            <div className="stat-card-label">Data Collected</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon amber"><Clock size={22} /></div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.pendingReview}</div>
            <div className="stat-card-label">Pending Review</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon green"><CheckCircle2 size={22} /></div>
          <div className="stat-card-content">
            <div className="stat-card-value">{stats.approved}</div>
            <div className="stat-card-label">Approved</div>
          </div>
        </div>
      </div>

      {/* Progress + Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        {/* Progress */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Overall Progress</h3>
            <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: 'var(--primary-500)' }}>
              {completionPercent}%
            </span>
          </div>
          <div className="progress-bar" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="progress-bar-fill" style={{ width: `${completionPercent}%` }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--neutral-500)' }}>
            <span>{stats.approved} of {stats.totalMetrics} metrics approved</span>
            <span>{stats.totalMetrics - stats.collected} remaining</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {quickActions.map(action => (
              <Link key={action.label} to={action.to} className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start' }}>
                <action.icon size={16} /> {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {recentActivity.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)',
                background: 'var(--neutral-50)',
              }}>
                <div>
                  <span style={{ fontWeight: 500, fontSize: 'var(--font-sm)' }}>{item.text}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span className={`status-badge ${item.status}`}>{item.status.replace('-', ' ')}</span>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-400)' }}>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

