'use client';

import { useEffect, useState } from 'react';
import { FilterCondition, ServiceField } from '@/lib/types';
import { FilterList } from '@/components/filters/FilterList';
import { FilterForm } from '@/components/filters/FilterForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCacheInvalidation } from '@/lib/hooks/useCacheInvalidation';

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
  const [editingFilter, setEditingFilter] = useState<FilterWithCategory | null>(
    null
  );
  const { invalidateFilters, invalidateFilterCategories } = useCacheInvalidation();

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

  useEffect(() => {
    fetchData();
  }, []);

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
    setDialogMode(null);
    toast.success('Filter created successfully');
  };

  const handleEdit = async (data: {
    name: string;
    categoryId: string;
    conditions: FilterCondition[];
    showAsTab: boolean;
    tabOrder: number;
  }) => {
    if (!editingFilter) return;

    const response = await fetch(`/api/filters/${editingFilter.id}`, {
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
    setDialogMode(null);
    setEditingFilter(null);
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

  const handleEditClick = (filter: FilterWithCategory) => {
    setEditingFilter(filter);
    setDialogMode('edit');
  };

  const handleCancel = () => {
    setDialogMode(null);
    setEditingFilter(null);
  };

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto min-h-screen p-3 sm:p-6">
        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={fetchData} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

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
      toast.error(
        err instanceof Error ? err.message : 'Failed to sync categories'
      );
      setIsLoading(false);
    }
  };

  if (categories.length === 0) {
    return (
      <>
        <Card className="mx-auto w-full max-w-2xl">
          <CardContent className="py-12 text-center">
            <h3 className="mb-2 text-lg font-semibold">
              No filter categories available
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Filter categories are required to create filters. Click below to
              automatically create categories for your existing services.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleSyncCategories}>
                Create Filter Categories
              </Button>
              <Link href="/services">
                <Button variant="outline">Go to Services</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="mb-4 sm:mb-6 flex justify-end">
        <Button onClick={handleOpenCreateDialog} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Filter
        </Button>
      </div>

      <FilterList
        filters={filters}
        onEdit={handleEditClick}
        onDelete={handleDelete}
      />

      {/* Create Filter Modal */}
      <Dialog
        open={dialogMode === 'create'}
        onOpenChange={(open) => !open && handleCancel()}
      >
        <DialogContent className="max-w-3xl h-[85vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="text-2xl">Create Filter</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6">
            <FilterForm
              categories={categories}
              onSubmit={handleCreate}
              onCancel={handleCancel}
              mode="create"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Filter Modal */}
      <Dialog
        open={dialogMode === 'edit'}
        onOpenChange={(open) => !open && handleCancel()}
      >
        <DialogContent className="max-w-3xl h-[85vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="text-2xl">Edit Filter</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6">
            {editingFilter && (
              <FilterForm
                initialData={{
                  name: editingFilter.name,
                  categoryId: editingFilter.categoryId,
                  conditions: editingFilter.conditions,
                  showAsTab: editingFilter.showAsTab,
                  tabOrder: editingFilter.tabOrder,
                }}
                categories={categories}
                onSubmit={handleEdit}
                onCancel={handleCancel}
                mode="edit"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
