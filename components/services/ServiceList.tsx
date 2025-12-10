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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {services.map((service) => (
        <Card
          key={service.id}
          className="flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg border-2 py-0"
        >
          <CardContent className="p-0 flex flex-col h-full">
            {/* Header with Actions */}
            <div className="bg-accent/50 p-3 border-b-2 flex items-center justify-between gap-3 px-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold truncate">{service.name}</h3>
                <span className="text-xs font-medium text-muted-foreground">
                  {service.fields.length} field
                  {service.fields.length !== 1 && 's'}
                </span>
              </div>

              <div className="flex gap-1 flex-shrink-0">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 border"
                  onClick={() => onEdit(service)}
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 border"
                  onClick={() => onClone(service)}
                  title="Clone"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
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
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Description */}
            {service.description && (
              <div className="px-3 pt-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {service.description}
                </p>
              </div>
            )}

            {/* Fields - Fixed height area with scroll */}
            <div className="px-3 py-3 flex-1 min-h-[180px] max-h-[180px] overflow-y-auto">
              <div className="space-y-2">
                {service.fields.map((field, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm bg-muted/80 rounded px-3 py-2 border"
                  >
                    <span className="font-semibold truncate flex-1">
                      {field.name}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-0.5 rounded flex-shrink-0 border">
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="text-destructive font-bold text-base flex-shrink-0">
                        *
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-accent/30 px-3 py-2.5 border-t-2 mt-auto">
              <div className="flex items-center justify-between text-xs">
                <div className="font-semibold text-foreground">
                  {service.filterCategories.length > 0 ? (
                    <>
                      {service.filterCategories.reduce(
                        (sum, cat) => sum + cat.filters.length,
                        0
                      )}{' '}
                      filter
                      {service.filterCategories.reduce(
                        (sum, cat) => sum + cat.filters.length,
                        0
                      ) !== 1 && 's'}
                    </>
                  ) : (
                    <span className="text-muted-foreground">No filters</span>
                  )}
                </div>
                <div className="text-muted-foreground">
                  {service.filterCategories.length} categor
                  {service.filterCategories.length === 1 ? 'y' : 'ies'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <ConfirmDialog />
    </div>
  );
}
