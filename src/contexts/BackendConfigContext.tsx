import React, { createContext, useContext, useState, useEffect } from 'react';

interface BackendConfigContextType {
  backendUrl: string;
  setBackendUrl: (url: string) => void;
}

const BackendConfigContext = createContext<BackendConfigContextType | undefined>(undefined);

export const useBackendConfig = () => {
  const context = useContext(BackendConfigContext);
  if (!context) {
    throw new Error('useBackendConfig must be used within a BackendConfigProvider');
  }
  return context;
};

export const BackendConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backendUrl, setBackendUrlState] = useState<string>(() => {
    return localStorage.getItem('backend-url') || 'http://localhost:5000';
  });

  const setBackendUrl = (url: string) => {
    setBackendUrlState(url);
    localStorage.setItem('backend-url', url);
  };

  useEffect(() => {
    localStorage.setItem('backend-url', backendUrl);
  }, [backendUrl]);

  return (
    <BackendConfigContext.Provider value={{ backendUrl, setBackendUrl }}>
      {children}
    </BackendConfigContext.Provider>
  );
};