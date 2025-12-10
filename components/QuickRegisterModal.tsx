'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ServiceField, ServiceFieldValue } from '@/lib/types';

interface QuickRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  aliasEmail: string;
  serviceName: string;
  serviceFields: ServiceField[];
  onSubmit: (
    aliasId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => Promise<void>;
  aliasId: string;
}

export function QuickRegisterModal({
  isOpen,
  onClose,
  aliasEmail,
  serviceName,
  serviceFields,
  onSubmit,
  aliasId,
}: QuickRegisterModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, ServiceFieldValue>>(
    {}
  );

  // Initialize form data with default values
  useEffect(() => {
    const initialData: Record<string, ServiceFieldValue> = {};
    serviceFields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initialData[field.name] = field.defaultValue;
      } else if (field.type === 'boolean') {
        initialData[field.name] = false;
      } else if (field.type === 'number') {
        initialData[field.name] = 0;
      } else if (field.type === 'date') {
        initialData[field.name] = new Date();
      } else {
        initialData[field.name] = '';
      }
    });
    setFormData(initialData);
  }, [serviceFields, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validate required fields
      for (const field of serviceFields) {
        if (field.required && !formData[field.name]) {
          toast.error(`${field.name} is required`);
          setIsLoading(false);
          return;
        }
      }

      // Submit all fields
      for (const [fieldName, value] of Object.entries(formData)) {
        await onSubmit(aliasId, serviceName, fieldName, value);
      }

      toast.success('Account registered successfully');
      onClose();
    } catch (error) {
      console.error('Failed to register account:', error);
      toast.error('Failed to register account');
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: ServiceField) => {
    const value = formData[field.name];

    switch (field.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              id={field.name}
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) =>
                setFormData({ ...formData, [field.name]: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor={field.name} className="cursor-pointer">
              {field.name}
            </Label>
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>{field.name}</Label>
            <Input
              id={field.name}
              type="date"
              value={
                value instanceof Date
                  ? value.toISOString().split('T')[0]
                  : String(value)
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [field.name]: new Date(e.target.value),
                })
              }
              required={field.required}
            />
          </div>
        );

      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>{field.name}</Label>
            <Input
              id={field.name}
              type="number"
              value={Number(value)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [field.name]: Number(e.target.value),
                })
              }
              required={field.required}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <Label htmlFor={field.name}>{field.name}</Label>
            <Input
              id={field.name}
              type="text"
              value={String(value)}
              onChange={(e) =>
                setFormData({ ...formData, [field.name]: e.target.value })
              }
              required={field.required}
              placeholder={field.description}
            />
            {field.description && (
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Register: {serviceName}</DialogTitle>
          <DialogDescription>
            Register <span className="font-semibold">{aliasEmail}</span> on{' '}
            {serviceName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {serviceFields.map((field) => (
            <div key={field.name}>{renderField(field)}</div>
          ))}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
