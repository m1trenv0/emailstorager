'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AliasWithStatus, ServiceFieldValue, Service } from '@/lib/types';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { useFetch } from '@/lib/hooks/useFetch';
import { AddServiceToAliasDialog } from './AddServiceToAliasDialog';
import { AliasCardHeader } from './alias-card/AliasCardHeader';
import { AliasServices } from './alias-card/AliasServices';
import { AliasComments } from './alias-card/AliasComments';

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
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  const { data: availableServices } = useFetch<Service[]>('/api/services', {
    cache: true,
    cacheTTL: 30000,
  });

  const services = availableServices || [];

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
      console.error('[AliasCard] Failed to update field:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCommentUpdate = async (comment: string) => {
    if (!onCommentUpdate) return;
    setIsUpdating(true);
    try {
      await onCommentUpdate(alias.id, comment);
    } catch (error) {
      console.error('Failed to update comment:', error);
      throw error;
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

  return (
    <article className="w-full">
      <Card>
        <CardHeader className="pb-2 pt-2 sm:pt-3 px-3 sm:px-6">
          <AliasCardHeader
            email={alias.email}
            createdAt={alias.createdAt}
            countsTowardLimit={alias.countsTowardLimit}
          />
        </CardHeader>

        <CardContent className="space-y-2 pt-0 pb-2 sm:pb-3 px-3 sm:px-6">
          <AliasServices
            aliasId={alias.id}
            aliasStatus={alias.status}
            services={services}
            isUpdating={isUpdating}
            onFieldUpdate={handleFieldUpdate}
            onAddService={
              onAddService ? () => setIsAddServiceDialogOpen(true) : undefined
            }
            onRemoveService={onRemoveService ? handleRemoveService : undefined}
          />

          <AliasComments
            aliasId={alias.id}
            comments={alias.comments}
            isUpdating={isUpdating}
            onCommentUpdate={onCommentUpdate ? handleCommentUpdate : undefined}
          />
        </CardContent>

        <AddServiceToAliasDialog
          isOpen={isAddServiceDialogOpen}
          onClose={() => setIsAddServiceDialogOpen(false)}
          onSubmit={handleAddService}
          availableServices={services}
          existingServices={Object.keys(alias.status)}
        />
        <ConfirmDialog />
      </Card>
    </article>
  );
}
