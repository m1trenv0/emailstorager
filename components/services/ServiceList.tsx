'use client';

import { ServiceWithCategories } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, Copy, Layers, FileText } from 'lucide-react';
import { useConfirm } from '@/lib/hooks/useConfirm';

interface ServiceListProps {
  services: ServiceWithCategories[];
  onEdit: (service: ServiceWithCategories) => void;
  onDelete: (serviceId: string) => void;
  onClone: (service: ServiceWithCategories) => void;
}

export function ServiceList({
  services,
  onEdit,
  onDelete,
  onClone,
}: ServiceListProps) {
  const { confirm, ConfirmDialog } = useConfirm();

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Layers className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No services yet</h3>
          <p className="text-sm text-muted-foreground">
            Create your first service to start managing dynamic account fields
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <Card key={service.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <header className="mb-2 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium">
                    {service.fields.length} fields
                  </span>
                </header>

                {service.description && (
                  <p className="mb-3 text-sm text-muted-foreground">
                    {service.description}
                  </p>
                )}

                <div className="mb-3 flex flex-wrap gap-2">
                  {service.fields.map((field, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-md border bg-background px-2 py-1 text-xs"
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      {field.name}
                      <span className="ml-1 text-muted-foreground">
                        ({field.type})
                      </span>
                      {field.required && (
                        <span className="ml-1 text-destructive">*</span>
                      )}
                    </span>
                  ))}
                </div>

                {service.filterCategories.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {service.filterCategories.reduce(
                      (sum, cat) => sum + cat.filters.length,
                      0
                    )}{' '}
                    filter(s) in {service.filterCategories.length} category(ies)
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(service)}
                  title="Edit service"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onClone(service)}
                  title="Clone service"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const confirmed = await confirm({
                      title: 'Delete Service',
                      description: `Are you sure you want to delete "${service.name}"? This action cannot be undone.`,
                      confirmText: 'Delete',
                      cancelText: 'Cancel',
                      variant: 'destructive',
                    });
                    if (confirmed) {
                      onDelete(service.id);
                    }
                  }}
                  title="Delete service"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <ConfirmDialog />
    </div>
  );
}
