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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
                <Select
                  value={selectedService}
                  onValueChange={setSelectedService}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a service..." />
                  </SelectTrigger>
                  <SelectContent>
                    {unaddedServices.map((service) => (
                      <SelectItem key={service.id} value={service.name}>
                        {service.name}
                        {service.description && ` - ${service.description}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedService && (
                <Alert>
                  <AlertDescription>
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
                  </AlertDescription>
                </Alert>
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
