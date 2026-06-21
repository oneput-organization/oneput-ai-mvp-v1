import { useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Bell, Search } from 'lucide-react';

const breadcrumbMap = {
  '/': 'Dashboard',
  '/setup/framework': 'Framework Setup',
  '/setup/company': 'Company Profile',
  '/registry': 'Metrics Registry',
  '/collection': 'Data Collection',
  '/chatbot': 'Oneput AI',
};

const sectionMap = {
  '/': 'Overview',
  '/setup/framework': 'Setup',
  '/setup/company': 'Setup',
  '/registry': 'Data Collection',
  '/collection': 'Data Collection',
  '/chatbot': 'AI Assistant',
};

export default function TopBar() {
  const { settings } = useApp();
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
        <div className="topbar-avatar" data-tooltip="Admin">A</div>
      </div>
    </header>
  );
}
