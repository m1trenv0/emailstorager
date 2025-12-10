import { useState } from 'react';
import { FilterCondition } from '@/lib/types';
import { toast } from 'sonner';
import { useCacheInvalidation } from '@/lib/hooks/useCacheInvalidation';

export function useFilterOperations(fetchData: () => Promise<void>) {
  const { invalidateFilters } = useCacheInvalidation();

  const handleCreate = async (data: {
    name: string;
    categoryId: string;
    conditions: FilterCondition[];
    showAsTab: boolean;
    tabOrder: number;
  }) => {
    const response = await fetch('/api/filters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create filter');
    }

    invalidateFilters();
    await fetchData();
    toast.success('Filter created successfully');
  };

  const handleUpdate = async (
    filterId: string,
    data: {
      name: string;
      categoryId: string;
      conditions: FilterCondition[];
      showAsTab: boolean;
      tabOrder: number;
    }
  ) => {
    const response = await fetch(`/api/filters/${filterId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update filter');
    }

    invalidateFilters();
    await fetchData();
    toast.success('Filter updated successfully');
  };

  const handleDelete = async (filterId: string) => {
    try {
      const response = await fetch(`/api/filters/${filterId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete filter');
      }

      invalidateFilters();
      await fetchData();
      toast.success('Filter deleted successfully');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete filter'
      );
    }
  };

  return {
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
