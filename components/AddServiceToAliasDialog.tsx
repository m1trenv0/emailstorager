'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Service } from '@/lib/types';

interface AddServiceToAliasDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (serviceName: string) => Promise<void>;
  availableServices: Service[];
  existingServices: string[];
}

export function AddServiceToAliasDialog({
  isOpen,
  onClose,
  onSubmit,
  availableServices,
  existingServices,
}: AddServiceToAliasDialogProps) {
  const [selectedService, setSelectedService] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out services that are already added to the alias
  const unaddedServices = availableServices.filter(
    (service) => !existingServices.includes(service.name)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedService);
      setSelectedService('');
      onClose();
    } catch (error) {
      console.error('Failed to add service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedService('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Service to Alias</DialogTitle>
          <DialogDescription>
            Select a service to track for this alias
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {unaddedServices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              All available services have been added to this alias.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <select
                  id="service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">Select a service...</option>
                  {unaddedServices.map((service) => (
                    <option key={service.id} value={service.name}>
                      {service.name}
                      {service.description && ` - ${service.description}`}
                    </option>
                  ))}
                </select>
              </div>

              {selectedService && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  <p className="font-medium mb-2">
                    This will initialize the following fields:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {unaddedServices
                      .find((s) => s.name === selectedService)
                      ?.fields.map((field) => (
                        <li key={field.name}>
                          {field.name} ({field.type})
                          {field.defaultValue !== undefined &&
                            ` - default: ${field.defaultValue}`}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {unaddedServices.length > 0 && (
              <Button type="submit" disabled={!selectedService || isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Service'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
