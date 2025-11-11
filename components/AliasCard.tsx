'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AliasWithStatus, ServiceFieldValue, Service } from '@/lib/types';
import { Mail, Calendar, Plus, Trash2 } from 'lucide-react';
import { ServiceFieldEditor } from './ServiceFieldEditor';
import { AddServiceToAliasDialog } from './AddServiceToAliasDialog';

interface AliasCardProps {
  alias: AliasWithStatus;
  onServiceFieldUpdate?: (
    aliasId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => Promise<void>;
  onCommentUpdate?: (aliasId: string, comment: string) => Promise<void>;
  onAddService?: (aliasId: string, serviceName: string) => Promise<void>;
  onRemoveService?: (aliasId: string, serviceName: string) => Promise<void>;
}

export function AliasCard({
  alias,
  onServiceFieldUpdate,
  onCommentUpdate,
  onAddService,
  onRemoveService,
}: AliasCardProps) {
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [comment, setComment] = useState(alias.comments || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (response.ok) {
          const servicesData = await response.json();
          setAvailableServices(servicesData);
        }
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    };

    fetchServices();
  }, []);

  const handleSaveComment = async () => {
    if (!onCommentUpdate) return;
    setIsUpdating(true);
    try {
      await onCommentUpdate(alias.id, comment);
      setIsEditingComment(false);
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFieldUpdate = async (
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => {
    if (!onServiceFieldUpdate) return;
    setIsUpdating(true);
    try {
      await onServiceFieldUpdate(alias.id, serviceName, fieldName, value);
    } catch (error) {
      console.error('Failed to update field:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddService = async (serviceName: string) => {
    if (!onAddService) return;
    setIsUpdating(true);
    try {
      await onAddService(alias.id, serviceName);
    } catch (error) {
      console.error('Failed to add service:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveService = async (serviceName: string) => {
    if (!onRemoveService) return;
    if (!confirm(`Remove ${serviceName} from this alias?`)) return;

    setIsUpdating(true);
    try {
      await onRemoveService(alias.id, serviceName);
    } catch (error) {
      console.error('Failed to remove service:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderServiceEditor = (serviceName: string) => {
    const service = availableServices.find((s) => s.name === serviceName);
    if (!service) return null;

    const currentValues = alias.status[serviceName] || {};

    return (
      <div key={serviceName} className="relative">
        <ServiceFieldEditor
          serviceName={serviceName}
          serviceFields={service.fields}
          currentValues={currentValues}
          onUpdate={(fieldName, value) =>
            handleFieldUpdate(serviceName, fieldName, value)
          }
          isUpdating={isUpdating}
        />
        {onRemoveService && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => handleRemoveService(serviceName)}
            disabled={isUpdating}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
    );
  };

  const services = Object.keys(alias.status);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" />
            <span className="break-all">{alias.email}</span>
          </CardTitle>
          {!alias.countsTowardLimit && (
            <Badge variant="secondary" className="text-xs">
              Not counted
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Created: {formatDate(alias.createdAt)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Service Fields */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Service Fields</Label>
            {onAddService && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddServiceDialogOpen(true)}
                disabled={isUpdating}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            )}
          </div>
          {services.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              No services added yet. Click &quot;Add Service&quot; to start
              tracking this alias.
            </p>
          ) : (
            <div className="space-y-3">
              {services.map((serviceName) => renderServiceEditor(serviceName))}
            </div>
          )}
        </section>

        {/* Comments Section */}
        <section className="space-y-2">
          <Label htmlFor={`comment-${alias.id}`}>Comments</Label>
          {isEditingComment ? (
            <div className="space-y-2">
              <Textarea
                id={`comment-${alias.id}`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add your comments here..."
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveComment}
                  disabled={isUpdating}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setComment(alias.comments || '');
                    setIsEditingComment(false);
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="min-h-[40px] rounded-md border p-3 text-sm">
                {alias.comments || 'No comments yet.'}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingComment(true)}
              >
                Edit Comment
              </Button>
            </div>
          )}
        </section>
      </CardContent>

      {/* Add Service Dialog */}
      <AddServiceToAliasDialog
        isOpen={isAddServiceDialogOpen}
        onClose={() => setIsAddServiceDialogOpen(false)}
        onSubmit={handleAddService}
        availableServices={availableServices}
        existingServices={services}
      />
    </Card>
  );
}
