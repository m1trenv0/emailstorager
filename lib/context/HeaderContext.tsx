'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface HeaderContextType {
  customAction: ReactNode;
  setCustomAction: (action: ReactNode) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export const HeaderProvider = ({ children }: { children: ReactNode }) => {
  const [customAction, setCustomAction] = useState<ReactNode>(null);

  return (
    <HeaderContext.Provider value={{ customAction, setCustomAction }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within HeaderProvider');
  }
  return context;
};