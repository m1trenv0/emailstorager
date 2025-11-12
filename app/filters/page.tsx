'use client';

import { useEffect, useState } from 'react';
import { FilterCondition, ServiceField } from '@/lib/types';
import { FilterList } from '@/components/filters/FilterList';
import { FilterForm } from '@/components/filters/FilterForm';
import { NavigationHeader } from '@/components/NavigationHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

type ViewMode = 'list' | 'create' | 'edit';

interface FilterWithCategory {
  id: string;
  name: string;
  categoryId: string;
  conditions: FilterCondition[];
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
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingFilter, setEditingFilter] = useState<FilterWithCategory | null>(
    null
  );

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

    await fetchData();
    setViewMode('list');
  };

  const handleEdit = async (data: {
    name: string;
    categoryId: string;
    conditions: FilterCondition[];
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

    await fetchData();
    setViewMode('list');
    setEditingFilter(null);
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
    setViewMode('edit');
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingFilter(null);
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

  if (categories.length === 0 && viewMode === 'list') {
    return (
      <main className="container mx-auto min-h-screen p-3 sm:p-6">
        <NavigationHeader />

        <Card className="mx-auto w-full max-w-2xl">
          <CardContent className="py-12 text-center">
            <h3 className="mb-2 text-lg font-semibold">
              No filter categories available
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              You need to create services first before you can create filters.
            </p>
            <Link href="/services">
              <Button>Go to Services</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto min-h-screen p-3 sm:p-6">
      <NavigationHeader
        customAction={
          viewMode === 'list' ? (
            <Button
              onClick={() => setViewMode('create')}
              className="w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Filter
            </Button>
          ) : undefined
        }
      />

      {viewMode === 'list' && (
        <FilterList
          filters={filters}
          onEdit={handleEditClick}
          onDelete={handleDelete}
        />
      )}

      {viewMode === 'create' && (
        <FilterForm
          categories={categories}
          onSubmit={handleCreate}
          onCancel={handleCancel}
          mode="create"
        />
      )}

      {viewMode === 'edit' && editingFilter && (
        <FilterForm
          initialData={{
            name: editingFilter.name,
            categoryId: editingFilter.categoryId,
            conditions: editingFilter.conditions,
          }}
          categories={categories}
          onSubmit={handleEdit}
          onCancel={handleCancel}
          mode="edit"
        />
      )}
    </main>
  );
}
