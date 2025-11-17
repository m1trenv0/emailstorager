'use client';

import { useEffect, useState } from 'react';
import { FilterCondition, ServiceField } from '@/lib/types';
import { FilterList } from '@/components/filters/FilterList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCacheInvalidation } from '@/lib/hooks/useCacheInvalidation';
import { useHeader } from '@/lib/context/HeaderContext';
import { useFilterOperations } from '@/lib/hooks/useFilterOperations';
import { LoadingState, ErrorState } from '@/components/page/LoadingAndError';
import { NoCategoriesState } from '@/components/filters/page/NoCategoriesState';
import { FilterDialog } from '@/components/filters/page/FilterDialog';

type DialogMode = 'create' | 'edit' | null;

interface FilterWithCategory {
  id: string;
  name: string;
  categoryId: string;
  conditions: FilterCondition[];
  showAsTab: boolean;
  tabOrder: number;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    serviceId: string;
    createdAt: Date;
    updatedAt: Date;
    service: { name: string };
  };
}

interface FilterCategory {
  id: string;
  name: string;
  serviceId: string;
  service: { name: string; fields: ServiceField[] };
}

export default function FiltersPage() {
  const [filters, setFilters] = useState<FilterWithCategory[]>([]);
  const [categories, setCategories] = useState<FilterCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editingFilter, setEditingFilter] = useState<FilterWithCategory | null>(null);

  const { invalidateFilterCategories } = useCacheInvalidation();
  const { setCustomAction } = useHeader();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [filtersRes, categoriesRes] = await Promise.all([
        fetch('/api/filters'),
        fetch('/api/filter-categories'),
      ]);

      if (!filtersRes.ok) throw new Error('Failed to fetch filters');
      if (!categoriesRes.ok) throw new Error('Failed to fetch categories');

      const filtersData = await filtersRes.json();
      const categoriesData = await categoriesRes.json();

      setFilters(filtersData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const { handleCreate, handleUpdate, handleDelete } = useFilterOperations(fetchData);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCustomAction(
      <Button onClick={() => setDialogMode('create')} className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Create Filter
      </Button>
    );
    return () => setCustomAction(null);
  }, []);

  const handleEditClick = (filter: FilterWithCategory) => {
    setEditingFilter(filter);
    setDialogMode('edit');
  };

  const handleDialogCancel = () => {
    setDialogMode(null);
    setEditingFilter(null);
  };

  const handleCreateSubmit = async (data: {
    name: string;
    categoryId: string;
    conditions: FilterCondition[];
    showAsTab: boolean;
    tabOrder: number;
  }) => {
    await handleCreate(data);
    setDialogMode(null);
  };

  const handleEditSubmit = async (data: {
    name: string;
    categoryId: string;
    conditions: FilterCondition[];
    showAsTab: boolean;
    tabOrder: number;
  }) => {
    if (!editingFilter) return;
    await handleUpdate(editingFilter.id, data);
    setDialogMode(null);
    setEditingFilter(null);
  };

  const handleSyncCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/filter-categories/sync', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync filter categories');
      }

      const result = await response.json();
      invalidateFilterCategories();
      toast.success(result.message);
      await fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to sync categories');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  if (categories.length === 0) {
    return <NoCategoriesState onSyncCategories={handleSyncCategories} />;
  }

  return (
    <>
      <FilterList filters={filters} onEdit={handleEditClick} onDelete={handleDelete} />

      <FilterDialog
        isOpen={dialogMode === 'create'}
        mode="create"
        categories={categories}
        onSubmit={handleCreateSubmit}
        onCancel={handleDialogCancel}
      />

      {editingFilter && (
        <FilterDialog
          isOpen={dialogMode === 'edit'}
          mode="edit"
          categories={categories}
          initialData={{
            name: editingFilter.name,
            categoryId: editingFilter.categoryId,
            conditions: editingFilter.conditions,
            showAsTab: editingFilter.showAsTab,
            tabOrder: editingFilter.tabOrder,
          }}
          onSubmit={handleEditSubmit}
          onCancel={handleDialogCancel}
        />
      )}
    </>
  );
}
