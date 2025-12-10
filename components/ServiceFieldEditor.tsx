'use client';

import { useState } from 'react';
import { ServiceField, ServiceFieldValue } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import {
  ServiceFieldEditorActions,
  ServiceFieldInput,
  ServiceFieldView,
} from '@/components/service-fields';
import { useServiceFieldEditing } from '@/lib/hooks/useServiceFieldEditing';

interface ServiceFieldEditorProps {
  serviceName: string;
  serviceFields: ServiceField[];
  currentValues: Record<string, ServiceFieldValue>;
  onUpdate: (fieldName: string, value: ServiceFieldValue) => Promise<void>;
  isUpdating?: boolean;
  renderEditButton?: boolean;
  renderFieldsOnly?: boolean;
  isEditing?: boolean;
  onEditComplete?: () => void;
  onEditStart?: () => void;
  onRemoveService?: () => void;
}

export function ServiceFieldEditor({
  serviceName,
  serviceFields,
  currentValues,
  onUpdate,
  isUpdating = false,
  renderEditButton = false,
  renderFieldsOnly = false,
  isEditing: externalIsEditing,
  onEditComplete,
  onEditStart,
  onRemoveService,
}: ServiceFieldEditorProps): React.ReactElement {
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const isEditing =
    externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;

  const handleEditStart = (): void => {
    if (onEditStart) {
      onEditStart();
    } else {
      setInternalIsEditing(true);
    }
  };

  const handleEditComplete = (): void => {
    if (onEditComplete) {
      onEditComplete();
    } else {
      setInternalIsEditing(false);
    }
  };

  const {
    editedValues,
    hasChanges,
    handleChange,
    resetValues,
    getChangedFields,
  } = useServiceFieldEditing(serviceFields, currentValues, isEditing);

  const handleSave = async (): Promise<void> => {
    if (!hasChanges) {
      handleEditComplete();
      return;
    }

    try {
      const changedFields = getChangedFields();
      for (const { name, value } of changedFields) {
        await onUpdate(name, value);
      }
      handleEditComplete();
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
  };

  const handleCancel = (): void => {
    resetValues();
    handleEditComplete();
  };

  // Render only action buttons
  if (renderEditButton) {
    return (
      <ServiceFieldEditorActions
        isEditing={isEditing}
        isUpdating={isUpdating}
        hasChanges={hasChanges}
        onEditStart={handleEditStart}
        onSave={handleSave}
        onCancel={handleCancel}
        onRemoveService={onRemoveService}
      />
    );
  }

  // Render only fields (no header/actions)
  if (renderFieldsOnly) {
    return (
      <div className="space-y-1">
        {isEditing ? (
          <>
            {serviceFields.map((field) => (
              <div key={field.name} className="text-sm">
                <ServiceFieldInput
                  serviceName={serviceName}
                  field={field}
                  value={editedValues[field.name]}
                  isEditing={isEditing}
                  isUpdating={isUpdating}
                  onChange={(value) => handleChange(field.name, value)}
                />
              </div>
            ))}
            <div className="flex gap-1 pt-2">
              <ServiceFieldEditorActions
                isEditing={true}
                isUpdating={isUpdating}
                hasChanges={hasChanges}
                onEditStart={handleEditStart}
                onSave={handleSave}
                onCancel={handleCancel}
                onRemoveService={onRemoveService}
              />
            </div>
          </>
        ) : (
          <div className="space-y-0.5">
            {serviceFields.map((field) => (
              <ServiceFieldView
                key={field.name}
                field={field}
                value={currentValues[field.name]}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full render with header and actions
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className="text-xs capitalize">
          {serviceName}
        </Badge>
        <ServiceFieldEditorActions
          isEditing={isEditing}
          isUpdating={isUpdating}
          hasChanges={hasChanges}
          onEditStart={handleEditStart}
          onSave={handleSave}
          onCancel={handleCancel}
          onRemoveService={onRemoveService}
        />
      </div>

      <div className="space-y-1">
        {isEditing ? (
          serviceFields.map((field) => (
            <div key={field.name} className="text-sm">
              <ServiceFieldInput
                serviceName={serviceName}
                field={field}
                value={editedValues[field.name]}
                isEditing={isEditing}
                isUpdating={isUpdating}
                onChange={(value) => handleChange(field.name, value)}
              />
            </div>
          ))
        ) : (
          <div className="space-y-0.5">
            {serviceFields.map((field) => (
              <ServiceFieldView
                key={field.name}
                field={field}
                value={currentValues[field.name]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
