'use client';

import { useEffect, useState } from 'react';
import { ServiceWithCategories, ServiceField } from '@/lib/types';
import { ServiceList } from '@/components/services/ServiceList';
import { ServiceForm } from '@/components/services/ServiceForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type ViewMode = 'list' | 'create' | 'edit';

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceWithCategories[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingService, setEditingService] =
    useState<ServiceWithCategories | null>(null);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleCreate = async (data: {
    name: string;
    description?: string;
    fields: ServiceField[];
  }) => {
    const response = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create service');
    }

    await fetchServices();
    setViewMode('list');
  };

  const handleEdit = async (data: {
    name: string;
    description?: string;
    fields: ServiceField[];
  }) => {
    if (!editingService) return;

    const response = await fetch(`/api/services/${editingService.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update service');
    }

    await fetchServices();
    setViewMode('list');
    setEditingService(null);
  };

  const handleDelete = async (serviceId: string) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete service');
      }

      await fetchServices();
      toast.success('Service deleted successfully');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete service'
      );
    }
  };

  const handleEditClick = (service: ServiceWithCategories) => {
    setEditingService(service);
    setViewMode('edit');
  };

  const handleClone = (service: ServiceWithCategories) => {
    setEditingService({
      ...service,
      name: `${service.name} (Copy)`,
      id: '',
    } as ServiceWithCategories);
    setViewMode('create');
  };

  const handleCancel = () => {
    setViewMode('list');
    setEditingService(null);
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
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={fetchServices} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <>
      <div className="mb-4 sm:mb-6 flex justify-end">
        {viewMode === 'list' && (
          <Button
            onClick={() => setViewMode('create')}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Service
          </Button>
        )}
      </div>

      {viewMode === 'list' && (
        <ServiceList
          services={services}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          onClone={handleClone}
        />
      )}

      {viewMode === 'create' && (
        <ServiceForm
          initialData={
            editingService
              ? {
                  name: editingService.name,
                  description: editingService.description,
                  fields: editingService.fields,
                }
              : undefined
          }
          onSubmit={handleCreate}
          onCancel={handleCancel}
          mode="create"
        />
      )}

      {viewMode === 'edit' && editingService && (
        <ServiceForm
          initialData={{
            name: editingService.name,
            description: editingService.description,
            fields: editingService.fields,
          }}
          onSubmit={handleEdit}
          onCancel={handleCancel}
          mode="edit"
        />
      )}
    </>
  );
}
