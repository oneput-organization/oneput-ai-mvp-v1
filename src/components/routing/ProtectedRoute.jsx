import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useUser } from '../../contexts/UserContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, permission }) {
  const { isSetupComplete } = useApp();
  const { can } = useUser();
  const location = useLocation();

  if (!isSetupComplete) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  if (permission && !can(permission)) {
    return (
      <div className="page-shell">
        <div className="empty-state">
          <div className="empty-state-icon"><ShieldAlert size={28} /></div>
          <h3>You don't have access to this page</h3>
          <p>Your current role lacks the required permission. Switch role from the top bar if needed.</p>
        </div>
      </div>
    );
  }

  return children;
}
