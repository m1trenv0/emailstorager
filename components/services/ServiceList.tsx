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
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <Layers className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
          <h3 className="mb-2 text-xl font-semibold">No services yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Create your first service to start managing dynamic account fields
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {services.map((service) => (
        <Card
          key={service.id}
          className="overflow-hidden transition-all duration-200 hover:shadow-md border-l-4 border-l-primary/20 hover:border-l-primary"
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <header className="mb-3 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <h3 className="text-xl font-semibold">{service.name}</h3>
                    <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                      {service.fields.length}{' '}
                      {service.fields.length === 1 ? 'field' : 'fields'}
                    </span>
                  </div>
                </header>

                {service.description && (
                  <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                )}

                <div className="mb-3 flex flex-wrap gap-2">
                  {service.fields.map((field, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-lg border bg-card px-3 py-1.5 text-xs font-medium shadow-sm hover:shadow transition-shadow"
                    >
                      <FileText className="mr-1.5 h-3.5 w-3.5 text-primary" />
                      <span className="font-semibold">{field.name}</span>
                      <span className="ml-1.5 text-muted-foreground">
                        ({field.type})
                      </span>
                      {field.required && (
                        <span className="ml-1 text-destructive font-bold">
                          *
                        </span>
                      )}
                    </span>
                  ))}
                </div>

                {service.filterCategories.length > 0 && (
                  <div className="text-xs text-muted-foreground font-medium mt-2 pt-2 border-t">
                    {service.filterCategories.reduce(
                      (sum, cat) => sum + cat.filters.length,
                      0
                    )}{' '}
                    filter
                    {service.filterCategories.reduce(
                      (sum, cat) => sum + cat.filters.length,
                      0
                    ) !== 1
                      ? 's'
                      : ''}{' '}
                    in {service.filterCategories.length}{' '}
                    {service.filterCategories.length === 1
                      ? 'category'
                      : 'categories'}
                  </div>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(service)}
                  title="Edit service"
                  className="hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onClone(service)}
                  title="Clone service"
                  className="hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
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
                  className="hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
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
