'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { AliasWithStatus, ServiceFieldValue, Service } from '@/lib/types';
import { ChevronDown, Edit2, MessageSquare } from 'lucide-react';
import { ServiceFieldEditor } from './ServiceFieldEditor';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { useFetch } from '@/lib/hooks/useFetch';
import { CopyEmailButton } from '@/components/ui/CopyEmailButton';

interface FilteredServiceCardProps {
  alias: AliasWithStatus;
  serviceName: string;
  onServiceFieldUpdate?: (
    aliasId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => Promise<void>;
  onCommentUpdate?: (aliasId: string, comment: string) => Promise<void>;
  onRemoveService?: (aliasId: string, serviceName: string) => Promise<void>;
}

export function FilteredServiceCard({
  alias,
  serviceName,
  onServiceFieldUpdate,
  onCommentUpdate,
  onRemoveService,
}: FilteredServiceCardProps) {
  const [comment, setComment] = useState(alias.comments || '');
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  const { data: servicesData } = useFetch<Service[]>('/api/services', {
    cache: true,
    cacheTTL: 30000,
  });

  const services = servicesData || [];
  const service = services.find((s) => s.name === serviceName);

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

  const handleRemoveService = async () => {
    if (!onRemoveService) return;
    const confirmed = await confirm({
      title: 'Remove Service',
      description: `Are you sure you want to remove ${serviceName} from this alias?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      await onRemoveService(alias.id, serviceName);
    } catch (error) {
      console.error('Failed to remove service:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!service) return null;

  const currentValues = alias.status[serviceName] || {};
  const isEditing = editingService === serviceName;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-1.5 pt-2 px-3">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-semibold leading-none break-all flex-1 min-w-0">
            {alias.email}
          </h4>
          <CopyEmailButton email={alias.email} size="icon" className="h-6 w-6" />
        </div>
      </CardHeader>

      <CardContent className="space-y-1.5 pt-0 pb-2 px-3">
        {/* Service Fields */}
        <div className="rounded border bg-card">
          <div className="p-1.5 space-y-1.5">
            <ServiceFieldEditor
              serviceName={serviceName}
              serviceFields={service.fields}
              currentValues={currentValues}
              onUpdate={async (fieldName, value) =>
                await handleFieldUpdate(fieldName, value)
              }
              onEditStart={() => setEditingService(serviceName)}
              onEditComplete={() => setEditingService(null)}
              isEditing={isEditing}
              isUpdating={isUpdating}
              renderEditButton={false}
              renderFieldsOnly={false}
              onRemoveService={
                onRemoveService ? handleRemoveService : undefined
              }
            />
          </div>
        </div>

        {/* Comments Section */}
        <Collapsible open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-70">
              <ChevronDown
                className="h-3 w-3 transition-transform"
                style={{
                  transform: isCommentsOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                }}
              />
              <MessageSquare className="h-3 w-3" />
              <span className="text-xs font-medium text-muted-foreground">
                Comments
              </span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1.5 space-y-1.5">
            {isEditingComment ? (
              <div className="space-y-1.5">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add your comments here..."
                  rows={2}
                  className="resize-none text-xs"
                />
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    className="h-6 text-xs"
                    onClick={handleSaveComment}
                    disabled={isUpdating}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-xs"
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
              <div className="space-y-1.5">
                {alias.comments ? (
                  <div className="rounded bg-muted px-2 py-0.5">
                    <p className="text-xs whitespace-pre-wrap">
                      {alias.comments}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic px-1">
                    No comments yet
                  </p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-6 text-xs"
                  onClick={() => setIsEditingComment(true)}
                >
                  {alias.comments ? 'Edit' : 'Add Comment'}
                </Button>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <ConfirmDialog />
    </Card>
  );
}
