import { NavLink } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import {
  LayoutDashboard,
  Settings,
  Building2,
  Database,
  ClipboardList,
  MessageSquare,
  CalendarClock,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Lock,
} from 'lucide-react';

const navItems = [
  {
    section: 'Overview',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard', protected: false },
    ],
  },
  {
    section: 'Setup',
    items: [
      { to: '/setup/framework', icon: Settings, label: 'Framework', protected: false },
      { to: '/setup/company', icon: Building2, label: 'Company Profile', protected: false },
    ],
  },
  {
    section: 'Data Collection',
    items: [
      { to: '/registry', icon: Database, label: 'Metrics Registry', protected: true },
      { to: '/collection', icon: ClipboardList, label: 'Data Collection', protected: true },
    ],
  },
  {
    section: 'AI Assistant',
    items: [
      { to: '/chatbot', icon: MessageSquare, label: 'Oneput AI', protected: true },
      { to: '/chasing', icon: CalendarClock, label: 'Data Chasing', protected: true },
    ],
  },
  {
    section: 'Report',
    items: [
      { to: '/report', icon: FileText, label: 'Report Builder', protected: true },
    ],
  },
];

export default function Sidebar() {
  const { settings, toggleSidebar, isSetupComplete } = useApp();
  const collapsed = settings.sidebarCollapsed;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Sparkles size={18} />
        </div>
        <span className="sidebar-logo-text">Oneput AI</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(section => (
          <div key={section.section} className="sidebar-section">
            <div className="sidebar-section-title">{section.section}</div>
            {section.items.map(item => {
              const locked = item.protected && !isSetupComplete;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${locked ? 'disabled' : ''}`}
                  onClick={locked ? e => e.preventDefault() : undefined}
                  title={locked ? 'Complete setup to unlock' : undefined}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                  {locked && !collapsed && <Lock size={13} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-toggle">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
