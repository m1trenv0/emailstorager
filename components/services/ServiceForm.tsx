'use client';

import { useState } from 'react';
import { ServiceField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FieldBuilder } from './FieldBuilder';
import { Loader2, AlertCircle, Plus } from 'lucide-react';

interface ServiceFormProps {
  initialData?: {
    name: string;
    description?: string;
    fields: ServiceField[];
  };
  onSubmit: (data: {
    name: string;
    description?: string;
    fields: ServiceField[];
  }) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

export function ServiceForm({
  initialData,
  onSubmit,
  onCancel,
  mode,
}: ServiceFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [fields, setFields] = useState<ServiceField[]>(
    initialData?.fields || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): string | null => {
    if (!name.trim()) {
      return 'Service name is required';
    }

    if (fields.length === 0) {
      return 'At least one field is required';
    }

    const fieldNames = new Set<string>();
    for (const field of fields) {
      if (!field.name.trim()) {
        return 'All fields must have a name';
      }

      if (fieldNames.has(field.name)) {
        return `Duplicate field name: ${field.name}`;
      }

      fieldNames.add(field.name);

      // Validate dependencies
      if (field.dependsOn) {
        for (const dep of field.dependsOn) {
          if (!fieldNames.has(dep)) {
            return `Field "${field.name}" depends on "${dep}" which appears later in the list`;
          }
        }
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        fields,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-full">
      <div className="flex-1 overflow-y-auto px-1 space-y-4 min-h-0">
        {/* Basic Fields */}
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="service-name" className="text-sm font-medium">
              Service Name
              <span className="text-red-500 ml-1">*</span>
              {mode === 'edit' && (
                <span className="text-xs text-muted-foreground ml-2 font-normal">
                  (cannot be changed)
                </span>
              )}
            </Label>
            <Input
              id="service-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Social Media, Banking, E-commerce"
              disabled={mode === 'edit'}
              className={mode === 'edit' ? 'bg-muted cursor-not-allowed' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="service-description"
              className="text-sm font-medium"
            >
              Description
              <span className="text-muted-foreground ml-1 font-normal text-xs">
                (optional)
              </span>
            </Label>
            <Textarea
              id="service-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this service..."
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        <div className="border-t my-4" />

        {/* Service Fields */}
        <div className="space-y-3 pb-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base font-semibold text-foreground">
              Service Fields
            </h3>
            <Button
              onClick={() => {
                const newField: ServiceField = {
                  name: '',
                  type: 'string',
                  required: false,
                };
                setFields([...fields, newField]);
              }}
              size="sm"
              type="button"
              variant="outline"
              className="flex-shrink-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Field
            </Button>
          </div>

          <FieldBuilder fields={fields} onChange={setFields} />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex-shrink-0 flex justify-end gap-3 pt-6 border-t my-3 bg-background">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="min-w-[100px]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="min-w-[140px]"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Service' : 'Update Service'}
        </Button>
      </div>
    </form>
  );
}
