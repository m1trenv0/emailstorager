'use client';

import { useEffect, useState } from 'react';
import { ServiceWithCategories, ServiceField } from '@/lib/types';
import { ServiceList } from '@/components/services/ServiceList';
import { ServiceForm } from '@/components/services/ServiceForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCacheInvalidation } from '@/lib/hooks/useCacheInvalidation';
import { useHeader } from '@/lib/context/HeaderContext';

type DialogMode = 'create' | 'edit' | null;

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceWithCategories[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editingService, setEditingService] =
    useState<ServiceWithCategories | null>(null);
  const { invalidateServices, invalidateFilterCategories } = useCacheInvalidation();
  const { setCustomAction } = useHeader();

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

  useEffect(() => {
    setCustomAction(
      <Button onClick={handleOpenCreateDialog} className="w-full sm:w-auto">
        <Plus className="mr-2 h-4 w-4" />
        Create Service
      </Button>
    );
    return () => setCustomAction(null);
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

    invalidateServices();
    invalidateFilterCategories();
    await fetchServices();
    setDialogMode(null);
    toast.success('Service created successfully');
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

    invalidateServices();
    invalidateFilterCategories();
    await fetchServices();
    setDialogMode(null);
    setEditingService(null);
    toast.success('Service updated successfully');
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

      invalidateServices();
      invalidateFilterCategories();
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
    setDialogMode('edit');
  };

  const handleClone = (service: ServiceWithCategories) => {
    setEditingService({
      ...service,
      name: `${service.name} (Copy)`,
      id: '',
    } as ServiceWithCategories);
    setDialogMode('create');
  };

  const handleCancel = () => {
    setDialogMode(null);
    setEditingService(null);
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
      <ServiceList
        services={services}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        onClone={handleClone}
      />

      {/* Create Service Modal */}
      <Dialog
        open={dialogMode === 'create'}
        onOpenChange={(open) => !open && handleCancel()}
      >
        <DialogContent className="max-w-3xl h-[85vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="text-2xl">Create Service</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6">
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Service Modal */}
      <Dialog
        open={dialogMode === 'edit'}
        onOpenChange={(open) => !open && handleCancel()}
      >
        <DialogContent className="max-w-3xl h-[85vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="text-2xl">Edit Service</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6">
            {editingService && (
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
