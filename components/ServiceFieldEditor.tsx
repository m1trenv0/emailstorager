'use client';

import { useState, useEffect } from 'react';
import { ServiceField, ServiceFieldValue } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit2, Save, X } from 'lucide-react';

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
}: ServiceFieldEditorProps) {
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;
  const setIsEditing = externalIsEditing !== undefined 
    ? (value: boolean) => { if (!value && onEditComplete) onEditComplete(); }
    : setInternalIsEditing;
  const [editedValues, setEditedValues] =
    useState<Record<string, ServiceFieldValue>>(currentValues);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditedValues(currentValues);
    setHasChanges(false);
  }, [currentValues]);

  useEffect(() => {
    // Check if there are any changes compared to current values
    const hasAnyChanges = Object.keys(editedValues).some(
      (key) => editedValues[key] !== currentValues[key]
    );
    setHasChanges(hasAnyChanges);
  }, [editedValues, currentValues]);

  const handleChange = (fieldName: string, value: ServiceFieldValue) => {
    setEditedValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSave = async () => {
    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    try {
      // Update all changed fields
      for (const [fieldName, value] of Object.entries(editedValues)) {
        if (currentValues[fieldName] !== value) {
          await onUpdate(fieldName, value);
        }
      }
      setIsEditing(false);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
  };

  const handleCancel = () => {
    setEditedValues(currentValues);
    setIsEditing(false);
    setHasChanges(false);
  };

  const renderFieldInput = (field: ServiceField) => {
    const value = editedValues[field.name];

    switch (field.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${serviceName}-${field.name}`}
              checked={value === true}
              onCheckedChange={(checked) =>
                handleChange(field.name, checked === true)
              }
              disabled={!isEditing || isUpdating}
            />
            <Label
              htmlFor={`${serviceName}-${field.name}`}
              className="text-xs font-normal cursor-pointer"
            >
              {field.name}
            </Label>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${serviceName}-${field.name}`} className="text-xs">
                {field.name}
                {field.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              {isEditing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1 text-xs"
                  onClick={() => handleChange(field.name, new Date().toISOString())}
                >
                  Set Current Day
                </Button>
              )}
            </div>
            <Input
              id={`${serviceName}-${field.name}`}
              type="date"
              value={
                value
                  ? new Date(value as string | number)
                      .toISOString()
                      .split('T')[0]
                  : ''
              }
              onChange={(e) =>
                handleChange(
                  field.name,
                  e.target.value ? new Date(e.target.value).toISOString() : null
                )
              }
              disabled={!isEditing || isUpdating}
              className="w-full text-xs h-7"
            />
          </div>
        );

      case 'number':
        return (
          <div className="space-y-1">
            <Label htmlFor={`${serviceName}-${field.name}`} className="text-xs">
              {field.name}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={`${serviceName}-${field.name}`}
              type="number"
              value={(value as number) ?? ''}
              onChange={(e) =>
                handleChange(
                  field.name,
                  e.target.value ? Number(e.target.value) : null
                )
              }
              disabled={!isEditing || isUpdating}
              className="w-full text-xs h-7"
            />
          </div>
        );

      case 'string':
      default:
        return (
          <div className="space-y-1">
            <Label htmlFor={`${serviceName}-${field.name}`} className="text-xs">
              {field.name}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={`${serviceName}-${field.name}`}
              type="text"
              value={(value as string) ?? ''}
              onChange={(e) => handleChange(field.name, e.target.value || null)}
              disabled={!isEditing || isUpdating}
              className="w-full text-xs h-7"
              placeholder={field.description}
            />
          </div>
        );
    }
  };

  const renderFieldValue = (field: ServiceField) => {
    const value = currentValues[field.name];

    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">Not set</span>;
    }

    switch (field.type) {
      case 'boolean':
        return (
          <Badge variant={value ? 'default' : 'secondary'}>
            {value ? 'Yes' : 'No'}
          </Badge>
        );

      case 'date':
        return new Date(value as string | number).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

      default:
        return <span className="font-medium">{String(value)}</span>;
    }
  };

  return (
    <>
      {renderEditButton && (
        !isEditing ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-5 px-1"
            onClick={() => setIsEditing(true)}
            disabled={isUpdating}
          >
            <Edit2 className="h-3 w-3 mr-0.5" />
            <span className="text-xs">Edit</span>
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button
              size="sm"
              className="h-5 px-1.5 text-xs"
              onClick={handleSave}
              disabled={!hasChanges || isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3 mr-0.5" />
              )}
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-5 px-1.5"
              onClick={handleCancel}
              disabled={isUpdating}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )
      )}
      {renderFieldsOnly && (
        <div className="space-y-1">
          {isEditing ? (
            // Edit mode - show inputs
            serviceFields.map((field) => (
              <div key={field.name} className="text-sm">{renderFieldInput(field)}</div>
            ))
          ) : (
            // View mode - show values
            <div className="space-y-0.5">
              {serviceFields.map((field) => (
                <div
                  key={field.name}
                  className="flex items-center justify-between gap-2 py-0.5"
                >
                  <span className="text-xs text-muted-foreground">
                    {field.name}:
                  </span>
                  <div className="text-xs">{renderFieldValue(field)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {!renderEditButton && !renderFieldsOnly && (
        <div className="space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="text-xs capitalize">
              {serviceName}
            </Badge>
            {!isEditing ? (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-1"
                onClick={() => setIsEditing(true)}
                disabled={isUpdating}
              >
                <Edit2 className="h-3 w-3 mr-1" />
                <span className="text-xs">Edit</span>
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={handleSave}
                  disabled={!hasChanges || isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3 mr-1" />
                  )}
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="space-y-1">
            {isEditing ? (
              // Edit mode - show inputs
              serviceFields.map((field) => (
                <div key={field.name} className="text-sm">{renderFieldInput(field)}</div>
              ))
            ) : (
              // View mode - show values
              <div className="space-y-0.5">
                {serviceFields.map((field) => (
                  <div
                    key={field.name}
                    className="flex items-center justify-between gap-2 py-0.5"
                  >
                    <span className="text-xs text-muted-foreground">
                      {field.name}:
                    </span>
                    <div className="text-xs">{renderFieldValue(field)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
