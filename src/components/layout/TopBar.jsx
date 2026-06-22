import { useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { roleLabel } from '../../data/permissions';
import { Bell, Search } from 'lucide-react';

const initialsOf = (name = '') => name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

const breadcrumbMap = {
  '/': 'Dashboard',
  '/setup/framework': 'Framework Setup',
  '/setup/company': 'Company Profile',
  '/registry': 'Metrics Registry',
  '/collection': 'Data Collection',
  '/chatbot': 'Oneput AI',
  '/chasing': 'Data Chasing',
  '/report': 'Report Builder',
  '/topics': 'Material Topics',
  '/audit': 'Audit Trail',
  '/findings': 'Findings',
  '/users': 'User Management',
};

const sectionMap = {
  '/': 'Overview',
  '/setup/framework': 'Setup',
  '/setup/company': 'Setup',
  '/registry': 'Data Collection',
  '/collection': 'Data Collection',
  '/chatbot': 'AI Assistant',
  '/chasing': 'AI Assistant',
  '/report': 'Report',
  '/topics': 'Data Collection',
  '/audit': 'Oversight',
  '/findings': 'Oversight',
  '/users': 'Administration',
};

export default function TopBar() {
  const { settings } = useApp();
  const { users, currentUser, switchUser } = useUser();
  const location = useLocation();
  const current = breadcrumbMap[location.pathname] || 'Page';
  const section = sectionMap[location.pathname] || '';

  return (
    <header className={`topbar ${settings.sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="topbar-left">
        <div className="topbar-breadcrumb">
          {section && (
            <>
              <span>{section}</span>
              <span className="topbar-breadcrumb-sep">/</span>
            </>
          )}
          <span className="topbar-breadcrumb-current">{current}</span>
        </div>
      </div>
      <div className="topbar-right">
        <button className="topbar-icon-btn" data-tooltip="Search">
          <Search size={18} />
        </button>
        <button className="topbar-icon-btn" data-tooltip="Notifications">
          <Bell size={18} />
          <span className="notification-dot"></span>
        </button>
        <select
          className="form-select"
          value={currentUser.id}
          onChange={e => switchUser(e.target.value)}
          data-tooltip="Switch role (demo)"
          style={{ height: 34, fontSize: 'var(--font-xs)', maxWidth: 220 }}
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name} · {roleLabel(u.role)}</option>
          ))}
        </select>
        <div className="topbar-avatar" data-tooltip={roleLabel(currentUser.role)}>
          {initialsOf(currentUser.name)}
        </div>
      </div>
    </header>
  );
}
