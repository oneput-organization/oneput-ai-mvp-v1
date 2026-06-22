import { NavLink } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import {
  LayoutDashboard,
  Settings,
  Building2,
  Database,
  ClipboardList,
  MessageSquare,
  CalendarClock,
  FileText,
  LayoutTemplate,
  History,
  Layers,
  Users as UsersIcon,
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
      { to: '/topics', icon: Layers, label: 'Material Topics', protected: true, permission: 'metric:manage' },
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
      { to: '/report/templates', icon: LayoutTemplate, label: 'Templates', protected: true, permission: 'template:manage' },
    ],
  },
  {
    section: 'Oversight',
    items: [
      { to: '/audit', icon: History, label: 'Audit Trail', protected: true, permission: 'audit:view' },
      { to: '/findings', icon: ClipboardList, label: 'Findings', protected: true, permission: 'finding:create' },
    ],
  },
  {
    section: 'Administration',
    items: [
      { to: '/users', icon: UsersIcon, label: 'User Management', protected: true, permission: 'user:manage' },
    ],
  },
];

export default function Sidebar() {
  const { settings, toggleSidebar, isSetupComplete } = useApp();
  const { can } = useUser();
  const collapsed = settings.sidebarCollapsed;

  // Hide items the current role lacks permission for, then drop empty sections.
  const visibleSections = navItems
    .map(section => ({ ...section, items: section.items.filter(i => !i.permission || can(i.permission)) }))
    .filter(section => section.items.length > 0);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Sparkles size={18} />
        </div>
        <span className="sidebar-logo-text">Oneput AI</span>
      </div>

      <nav className="sidebar-nav">
        {visibleSections.map(section => (
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
