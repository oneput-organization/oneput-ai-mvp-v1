import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { UserProvider } from './contexts/UserContext';
import { DataProvider } from './contexts/DataContext';
import { AssistantProvider } from './contexts/AssistantContext';
import { ReportProvider } from './contexts/ReportContext';
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
import ChasingPanel from './pages/chatbot/ChasingPanel';
import ReportBuilder from './pages/report/ReportBuilder';
import MaterialTopics from './pages/registry/MaterialTopics';
import AuditLog from './pages/audit/AuditLog';
import Findings from './pages/audit/Findings';
import UsersAdmin from './pages/admin/UsersAdmin';
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
              <ProtectedRoute permission="data:view"><MetricsRegistry /></ProtectedRoute>
            } />
            <Route path="/collection" element={
              <ProtectedRoute permission="data:view"><DataCollection /></ProtectedRoute>
            } />
            <Route path="/chatbot" element={
              <ProtectedRoute permission="data:view"><ChatbotPage /></ProtectedRoute>
            } />
            <Route path="/chasing" element={
              <ProtectedRoute permission="data:view-all"><ChasingPanel /></ProtectedRoute>
            } />
            <Route path="/report" element={
              <ProtectedRoute permission="data:view"><ReportBuilder /></ProtectedRoute>
            } />
            <Route path="/topics" element={
              <ProtectedRoute permission="metric:manage"><MaterialTopics /></ProtectedRoute>
            } />
            <Route path="/audit" element={
              <ProtectedRoute permission="audit:view"><AuditLog /></ProtectedRoute>
            } />
            <Route path="/findings" element={
              <ProtectedRoute permission="finding:create"><Findings /></ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute permission="user:manage"><UsersAdmin /></ProtectedRoute>
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
        <UserProvider>
          <DataProvider>
            <AssistantProvider>
              <ReportProvider>
                <AppLayout />
              </ReportProvider>
            </AssistantProvider>
          </DataProvider>
        </UserProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
