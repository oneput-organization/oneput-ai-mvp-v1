import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';

export default function ProtectedRoute({ children }) {
  const { isSetupComplete } = useApp();
  const location = useLocation();

  if (!isSetupComplete) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return children;
}
