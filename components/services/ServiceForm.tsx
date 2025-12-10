'use client';

import { useState } from 'react';
import { ServiceField } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FieldBuilder } from './FieldBuilder';
import { ServiceFormBasicFields } from './ServiceFormBasicFields';
import { Loader2, AlertCircle, Plus } from 'lucide-react';
import { validateServiceForm } from '@/lib/validation/service-validation';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateServiceForm(name, fields);
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
        <ServiceFormBasicFields
          name={name}
          description={description}
          mode={mode}
          onNameChange={setName}
          onDescriptionChange={setDescription}
        />

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
