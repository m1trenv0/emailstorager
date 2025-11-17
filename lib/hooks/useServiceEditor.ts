import { useState } from 'react';
import { ServiceFieldValue } from '@/lib/types';

export function useServiceEditor() {
  const [editingService, setEditingService] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const startEditing = (serviceName: string) => {
    setEditingService(serviceName);
  };

  const stopEditing = () => {
    setEditingService(null);
  };

  const withLoading = async <T,>(fn: () => Promise<T>): Promise<T> => {
    setIsUpdating(true);
    try {
      return await fn();
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    editingService,
    isUpdating,
    startEditing,
    stopEditing,
    withLoading,
  };
}
