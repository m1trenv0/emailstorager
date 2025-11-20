'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AccountWithAliases, Service, ServiceFieldValue } from '@/lib/types';
import { Mail, Calendar } from 'lucide-react';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { useFetch } from '@/lib/hooks/useFetch';
import { AddServiceToAliasDialog } from './AddServiceToAliasDialog';
import { AccountDetailsActions } from './account-details/AccountDetailsActions';
import { RecoveryCredentials } from './account-details/RecoveryCredentials';
import { AccountServices } from './account-details/AccountServices';
import { AccountAliasesList } from './account-details/AccountAliasesList';
import { canAddAlias, formatDate } from '@/lib/business-logic';

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountWithAliases | null;
  onAddAlias: (accountId: string) => void;
  onDelete: (accountId: string) => void;
  onServiceFieldUpdate?: (
    aliasId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => Promise<void>;
  onUpdateAliasComment?: (aliasId: string, comment: string) => Promise<void>;
  onAddService?: (aliasId: string, serviceName: string) => Promise<void>;
  onRemoveService?: (aliasId: string, serviceName: string) => Promise<void>;
  onAccountServiceFieldUpdate?: (
    accountId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => Promise<void>;
  onAddServiceToAccount?: (accountId: string, serviceName: string) => Promise<void>;
  onRemoveServiceFromAccount?: (accountId: string, serviceName: string) => Promise<void>;
}

export function AccountDetailsModal({
  isOpen,
  onClose,
  account,
  onAddAlias,
  onDelete,
  onServiceFieldUpdate,
  onUpdateAliasComment,
  onAddService,
  onRemoveService,
  onAccountServiceFieldUpdate,
  onAddServiceToAccount,
  onRemoveServiceFromAccount,
}: AccountDetailsModalProps) {
  const { confirm, ConfirmDialog } = useConfirm();
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: availableServices } = useFetch<Service[]>('/api/services', {
    cache: true,
    cacheTTL: 30000,
  });

  const services = availableServices || [];

  if (!account) return null;

  const formatDateLong = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const aliasResult = canAddAlias(account.lastAliasAddedAt, account.aliasesAddedInPeriod);

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Account',
      description: `Are you sure you want to delete ${account.primaryEmail} and all its ${account.aliases.length} aliases? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (confirmed) {
      onDelete(account.id);
      onClose();
    }
  };

  const handleAccountFieldUpdate = async (
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => {
    if (!onAccountServiceFieldUpdate) return;
    setIsUpdating(true);
    try {
      await onAccountServiceFieldUpdate(account.id, serviceName, fieldName, value);
    } catch (error) {
      console.error('Failed to update account service field:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddServiceToAccount = async (serviceName: string) => {
    if (!onAddServiceToAccount) return;
    setIsUpdating(true);
    try {
      await onAddServiceToAccount(account.id, serviceName);
    } catch (error) {
      console.error('Failed to add service to account:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveServiceFromAccount = async (serviceName: string) => {
    if (!onRemoveServiceFromAccount) return;
    const confirmed = await confirm({
      title: 'Remove Service',
      description: `Are you sure you want to remove ${serviceName} from this account?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      await onRemoveServiceFromAccount(account.id, serviceName);
    } catch (error) {
      console.error('Failed to remove service from account:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const accountStatus =
    typeof account.status === 'object' && account.status !== null
      ? (account.status as Record<string, Record<string, ServiceFieldValue>>)
      : {};

  const aliases = account.aliases.map((alias) => ({
    ...alias,
    status: alias.status as Record<string, Record<string, ServiceFieldValue>>,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl break-all">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
            <span className="break-all">{account.primaryEmail}</span>
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
              <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">{formatDateLong(account.createdAt)}</span>
              <span className="sm:hidden">{formatDateShort(account.createdAt)}</span>
            </span>
            <Badge variant="secondary" className="text-xs">
              {account.aliases.length} {account.aliases.length === 1 ? 'alias' : 'aliases'}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          <section>
            <RecoveryCredentials
              email={account.recoveryEmail}
              password={account.recoveryPassword}
            />
          </section>

          <Separator />

          <section>
            <AccountServices
              accountId={account.id}
              accountStatus={accountStatus}
              services={services}
              isUpdating={isUpdating}
              onFieldUpdate={handleAccountFieldUpdate}
              onAddService={
                onAddServiceToAccount
                  ? () => setIsAddServiceDialogOpen(true)
                  : undefined
              }
              onRemoveService={
                onRemoveServiceFromAccount
                  ? handleRemoveServiceFromAccount
                  : undefined
              }
            />
          </section>

          <Separator />

          <section>
            <AccountDetailsActions
              accountId={account.id}
              canAddAlias={aliasResult.canAdd}
              onAddAlias={onAddAlias}
              onDelete={handleDelete}
              onClose={onClose}
            />
          </section>

          <Separator />

          <section>
            <AccountAliasesList
              aliases={aliases}
              onServiceFieldUpdate={onServiceFieldUpdate}
              onCommentUpdate={onUpdateAliasComment}
              onAddService={onAddService}
              onRemoveService={onRemoveService}
            />
          </section>
        </div>
      </DialogContent>
      <ConfirmDialog />
      <AddServiceToAliasDialog
        isOpen={isAddServiceDialogOpen}
        onClose={() => setIsAddServiceDialogOpen(false)}
        onSubmit={handleAddServiceToAccount}
        availableServices={services}
        existingServices={Object.keys(accountStatus)}
      />
    </Dialog>
  );
}
