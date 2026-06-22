import { createContext, useContext, useState } from 'react';
import { storage } from '../utils/storage';

const AppContext = createContext();

const REQUIRED_COMPANY_FIELDS = ['name', 'industry', 'employeeCount', 'revenueRange', 'reportingPeriodStart', 'reportingPeriodEnd', 'country'];

const DEFAULT_COMPANY = {
  name: '',
  industry: '',
  employeeCount: '',
  revenueRange: '',
  reportingPeriodStart: '',
  reportingPeriodEnd: '',
  country: '',
  description: '',
};

const DEFAULT_SETTINGS = {
  framework: null,
  setupComplete: false,
  sidebarCollapsed: false,
};

export function AppProvider({ children }) {
  const [company, setCompanyState] = useState(() => storage.get('company', DEFAULT_COMPANY));
  const [settings, setSettingsState] = useState(() => storage.get('settings', DEFAULT_SETTINGS));

  const setCompany = (data) => {
    const updated = { ...company, ...data };
    setCompanyState(updated);
    storage.set('company', updated);
  };

  const setSettings = (data) => {
    const updated = { ...settings, ...data };
    setSettingsState(updated);
    storage.set('settings', updated);
  };

  const toggleSidebar = () => {
    setSettings({ sidebarCollapsed: !settings.sidebarCollapsed });
  };

  const companyCompletion = () => {
    const filled = REQUIRED_COMPANY_FIELDS.filter(k => {
      const v = company[k];
      return v && v.toString().trim() !== '';
    });
    return Math.round((filled.length / REQUIRED_COMPANY_FIELDS.length) * 100);
  };

  const isCompanyComplete = REQUIRED_COMPANY_FIELDS.every(k => {
    const v = company[k];
    return v && v.toString().trim() !== '';
  });

  // isSetupComplete only becomes true when the user explicitly finishes the wizard
  const isSetupComplete = settings.setupComplete === true;
  // Used inside the wizard to know when all prerequisites are met
  const isReadyToFinish = isCompanyComplete && !!settings.framework;

  const completeSetup = () => {
    setSettings({ setupComplete: true });
  };

  return (
    <AppContext.Provider value={{
      company,
      setCompany,
      settings,
      setSettings,
      toggleSidebar,
      companyCompletion,
      isCompanyComplete,
      isSetupComplete,
      isReadyToFinish,
      completeSetup,
    }}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext);
