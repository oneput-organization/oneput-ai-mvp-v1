import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { DataProvider } from './contexts/DataContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import ChatWindow from './components/chatbot/ChatWindow';
import Dashboard from './pages/Dashboard';
import FrameworkSetup from './pages/setup/FrameworkSetup';
import CompanyProfile from './pages/setup/CompanyProfile';
import MetricsRegistry from './pages/registry/MetricsRegistry';
import DataCollection from './pages/collection/DataCollection';
import ChatbotPage from './pages/chatbot/ChatbotPage';
import SetupWizard from './pages/onboarding/SetupWizard';

function AppLayout() {
  const { settings, isSetupComplete } = useApp();

  // Before setup is done, show wizard without the main shell
  if (!isSetupComplete) {
    return (
      <Routes>
        <Route path="/onboarding" element={<SetupWizard />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className={`app-main ${settings.sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <TopBar />
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/setup/framework" element={<FrameworkSetup />} />
            <Route path="/setup/company" element={<CompanyProfile />} />
            <Route path="/registry" element={
              <ProtectedRoute><MetricsRegistry /></ProtectedRoute>
            } />
            <Route path="/collection" element={
              <ProtectedRoute><DataCollection /></ProtectedRoute>
            } />
            <Route path="/chatbot" element={
              <ProtectedRoute><ChatbotPage /></ProtectedRoute>
            } />
            <Route path="/onboarding" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <ChatWindow />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <DataProvider>
          <AppLayout />
        </DataProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
