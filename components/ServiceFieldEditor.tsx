'use client';

import { useState, useEffect } from 'react';
import { ServiceField, ServiceFieldValue } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit2, Save, X } from 'lucide-react';

interface ServiceFieldEditorProps {
  serviceName: string;
  serviceFields: ServiceField[];
  currentValues: Record<string, ServiceFieldValue>;
  onUpdate: (fieldName: string, value: ServiceFieldValue) => Promise<void>;
  isUpdating?: boolean;
}

export function ServiceFieldEditor({
  serviceName,
  serviceFields,
  currentValues,
  onUpdate,
  isUpdating = false,
}: ServiceFieldEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] =
    useState<Record<string, ServiceFieldValue>>(currentValues);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditedValues(currentValues);
  }, [currentValues]);

  const handleChange = (fieldName: string, value: ServiceFieldValue) => {
    setEditedValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setHasChanges(true);
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
              className="text-sm font-normal cursor-pointer"
            >
              {field.name}
            </Label>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-1">
            <Label htmlFor={`${serviceName}-${field.name}`} className="text-sm">
              {field.name}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
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
              className="w-full"
            />
          </div>
        );

      case 'number':
        return (
          <div className="space-y-1">
            <Label htmlFor={`${serviceName}-${field.name}`} className="text-sm">
              {field.name}
              {field.required && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Input
              id={`${serviceName}-${field.name}`}
              type="number"
              value={value ?? ''}
              onChange={(e) =>
                handleChange(
                  field.name,
                  e.target.value ? Number(e.target.value) : null
                )
              }
              disabled={!isEditing || isUpdating}
              className="w-full"
            />
          </div>
        );

      case 'string':
      default:
        return (
          <div className="space-y-1">
            <Label htmlFor={`${serviceName}-${field.name}`} className="text-sm">
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
              className="w-full"
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
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-sm capitalize">
              {serviceName}
            </Badge>
            {!isEditing ? (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                disabled={isUpdating}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasChanges || isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="space-y-3">
            {isEditing ? (
              // Edit mode - show inputs
              serviceFields.map((field) => (
                <div key={field.name}>{renderFieldInput(field)}</div>
              ))
            ) : (
              // View mode - show values
              <div className="grid grid-cols-1 gap-3">
                {serviceFields.map((field) => (
                  <div
                    key={field.name}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-sm text-muted-foreground">
                      {field.name}:
                    </span>
                    <div className="text-sm">{renderFieldValue(field)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
