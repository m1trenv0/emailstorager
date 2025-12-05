'use client';

import { useState, useCallback } from 'react';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { ServiceFieldValue, AccountWithAliases } from '@/lib/types';

interface UseAccountDetailsModalHandlersProps {
  account: AccountWithAliases | null;
  onDelete: (accountId: string) => void;
  onClose: () => void;
  onAccountServiceFieldUpdate?: (
    accountId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => Promise<void>;
  onAddServiceToAccount?: (accountId: string, serviceName: string) => Promise<void>;
  onRemoveServiceFromAccount?: (accountId: string, serviceName: string) => Promise<void>;
}

interface UseAccountDetailsModalHandlersReturn {
  isUpdating: boolean;
  isAddServiceDialogOpen: boolean;
  setIsAddServiceDialogOpen: (open: boolean) => void;
  handleDelete: () => Promise<void>;
  handleAccountFieldUpdate: (
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => Promise<void>;
  handleAddServiceToAccount: (serviceName: string) => Promise<void>;
  handleRemoveServiceFromAccount: (serviceName: string) => Promise<void>;
  confirm: ReturnType<typeof useConfirm>['confirm'];
  ConfirmDialog: ReturnType<typeof useConfirm>['ConfirmDialog'];
}

/**
 * Custom hook for handling account details modal operations
 * Separates business logic from presentation
 */
export function useAccountDetailsModalHandlers({
  account,
  onDelete,
  onClose,
  onAccountServiceFieldUpdate,
  onAddServiceToAccount,
  onRemoveServiceFromAccount,
}: UseAccountDetailsModalHandlersProps): UseAccountDetailsModalHandlersReturn {
  const { confirm, ConfirmDialog } = useConfirm();
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!account) return;

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
  }, [account, confirm, onDelete, onClose]);

  const handleAccountFieldUpdate = useCallback(
    async (serviceName: string, fieldName: string, value: ServiceFieldValue) => {
      if (!onAccountServiceFieldUpdate || !account) return;

      setIsUpdating(true);
      try {
        await onAccountServiceFieldUpdate(account.id, serviceName, fieldName, value);
      } catch (error) {
        console.error('Failed to update account service field:', error);
      } finally {
        setIsUpdating(false);
      }
    },
    [account, onAccountServiceFieldUpdate]
  );

  const handleAddServiceToAccount = useCallback(
    async (serviceName: string) => {
      if (!onAddServiceToAccount || !account) return;

      setIsUpdating(true);
      try {
        await onAddServiceToAccount(account.id, serviceName);
      } catch (error) {
        console.error('Failed to add service to account:', error);
        throw error;
      } finally {
        setIsUpdating(false);
      }
    },
    [account, onAddServiceToAccount]
  );

  const handleRemoveServiceFromAccount = useCallback(
    async (serviceName: string) => {
      if (!onRemoveServiceFromAccount || !account) return;

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
    },
    [account, confirm, onRemoveServiceFromAccount]
  );

  return {
    isUpdating,
    isAddServiceDialogOpen,
    setIsAddServiceDialogOpen,
    handleDelete,
    handleAccountFieldUpdate,
    handleAddServiceToAccount,
    handleRemoveServiceFromAccount,
    confirm,
    ConfirmDialog,
  };
}
