'use client';

import { useState } from 'react';
import { ServiceField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FieldBuilder } from './FieldBuilder';
import { Loader2 } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-l-4 border-l-primary/30">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-xl">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="service-name" className="text-sm font-semibold">
              Service Name <span className="text-destructive font-bold">*</span>
            </Label>
            <Input
              id="service-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., AliExpress, Augment"
              disabled={mode === 'edit'}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                💡 Service name cannot be changed after creation
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="service-description"
              className="text-sm font-semibold"
            >
              Description
            </Label>
            <Textarea
              id="service-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description of this service"
              rows={3}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-primary/30">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle className="text-xl">Service Fields</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Define the fields that will be available for this service
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <FieldBuilder fields={fields} onChange={setFields} />
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <footer className="flex justify-end gap-4 sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 -mx-4 -mb-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="min-w-[100px]"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Create Service' : 'Update Service'}
        </Button>
      </footer>
    </form>
  );
}
