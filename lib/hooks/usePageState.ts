'use client';

import { useState } from 'react';

interface UsePageState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function usePageState(initialTab = 'all'): UsePageState {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(initialTab);

  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
  };
}
