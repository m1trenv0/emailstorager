'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Service, ServiceFieldValue } from '@/lib/types';
import { ServiceFieldEditor } from '@/components/ServiceFieldEditor';

interface AliasServicesProps {
  aliasId: string;
  aliasStatus: Record<string, Record<string, ServiceFieldValue>>;
  services: Service[];
  isUpdating: boolean;
  onFieldUpdate: (
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => Promise<void>;
  onAddService?: () => void;
  onRemoveService?: (serviceName: string) => Promise<void>;
}

export function AliasServices({
  aliasId,
  aliasStatus,
  services,
  isUpdating,
  onFieldUpdate,
  onAddService,
  onRemoveService,
}: AliasServicesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);

  const aliasServices = Object.keys(aliasStatus);

  const renderServiceEditor = (serviceName: string) => {
    const service = services.find((s) => s.name === serviceName);
    if (!service) return null;

    const currentValues = aliasStatus[serviceName] || {};
    const isEditing = editingService === serviceName;

    return (
      <div key={serviceName} className="rounded border bg-card p-2 space-y-2">
        <ServiceFieldEditor
          serviceName={serviceName}
          serviceFields={service.fields}
          currentValues={currentValues}
          onUpdate={async (fieldName, value) =>
            await onFieldUpdate(serviceName, fieldName, value)
          }
          onEditStart={() => setEditingService(serviceName)}
          onEditComplete={() => setEditingService(null)}
          isEditing={isEditing}
          isUpdating={isUpdating}
          renderEditButton={false}
          renderFieldsOnly={false}
          onRemoveService={
            onRemoveService ? () => onRemoveService(serviceName) : undefined
          }
        />
      </div>
    );
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-70">
            <ChevronDown
              className="h-3 w-3 transition-transform"
              style={{
                transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
              }}
            />
            <span className="text-xs font-medium text-muted-foreground">
              Services ({aliasServices.length})
            </span>
          </div>
        </CollapsibleTrigger>
        {onAddService && isOpen && (
          <Button
            size="sm"
            variant="ghost"
            className="h-5 w-5 p-0"
            onClick={onAddService}
            disabled={isUpdating}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
      <CollapsibleContent className="mt-2 space-y-2">
        {aliasServices.length === 0 ? (
          <p className="text-xs text-muted-foreground italic px-2">
            No services added yet
          </p>
        ) : (
          <div className="space-y-2">
            {aliasServices.map((serviceName) =>
              renderServiceEditor(serviceName)
            )}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
