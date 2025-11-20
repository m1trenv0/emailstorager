'use client';

import { useState, useCallback } from 'react';

interface UseModalState {
  isOpen: boolean;
  currentId: string | null;
  open: (id: string) => void;
  close: () => void;
}

export function useModalState(): UseModalState {
  const [isOpen, setIsOpen] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const open = useCallback((id: string) => {
    setCurrentId(id);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setCurrentId(null);
  }, []);

  return {
    isOpen,
    currentId,
    open,
    close,
  };
}