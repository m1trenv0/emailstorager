'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AliasWithStatus, ServiceFieldValue, Service } from '@/lib/types';
import { Mail, Calendar, Plus, Trash2, ChevronDown } from 'lucide-react';
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
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

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
      <Collapsible open={isServicesOpen} onOpenChange={setIsServicesOpen}>
        <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-70">
              <ChevronDown
                className="h-4 w-4 transition-transform flex-shrink-0"
                style={{
                  transform: isServicesOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                }}
              />
              <Mail className="h-4 w-4 flex-shrink-0" />
            </div>
          </CollapsibleTrigger>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base break-all">{alias.email}</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(alias.createdAt)}</span>
              {!alias.countsTowardLimit && (
                <Badge variant="secondary" className="text-xs ml-1">
                  Not counted
                </Badge>
              )}
            </div>
          </div>
          {services.length > 0 && !isServicesOpen && (
            <span className="text-xs text-muted-foreground flex-shrink-0">
              Services ({services.length})
            </span>
          )}
          {onAddService && isServicesOpen && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs"
              onClick={() => setIsAddServiceDialogOpen(true)}
              disabled={isUpdating}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
        {/* Collapsible Services Content */}
        <CollapsibleContent className="space-y-2">
          {services.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">
              No services added yet.
            </p>
          ) : (
            <div className="space-y-2">
              {services.map((serviceName) => renderServiceEditor(serviceName))}
            </div>
          )}
        </CollapsibleContent>

        {/* Collapsible Comments Section */}
        <Collapsible open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-2 p-0 h-8 cursor-pointer">
              <ChevronDown
                className="h-4 w-4 transition-transform"
                style={{
                  transform: isCommentsOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                }}
              />
              <span className="text-sm">Comments</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {isEditingComment ? (
              <div className="space-y-2">
                <Textarea
                  id={`comment-${alias.id}`}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add your comments here..."
                  rows={2}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleSaveComment}
                    disabled={isUpdating}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
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
                <p className="text-sm px-2 py-1 rounded bg-muted">
                  {alias.comments || 'No comments yet.'}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-7 text-xs"
                  onClick={() => setIsEditingComment(true)}
                >
                  Edit
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
        </CardContent>
      </Collapsible>

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
