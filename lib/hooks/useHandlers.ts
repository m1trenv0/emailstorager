import { useCallback } from 'react';
import { useAccountStore } from '@/lib/store/useAccountStore';
import { AccountWithAliases, ServiceStatus } from '@/lib/types';

interface UseHandlersProps {
  addAccountMutation: (data: {
    primaryEmail: string;
    recoveryEmail: string;
    recoveryPassword: string;
  }) => Promise<void>;
  deleteAccountMutation: (accountId: string) => Promise<void>;
  selectAccountMutation: (accountId: string) => void;
  addAliasMutation: (
    accountId: string,
    email: string,
    countsTowardLimit: boolean
  ) => Promise<void>;
  updateAliasStatusMutation: (
    aliasId: string,
    service: 'aliexpress' | 'augment',
    status: ServiceStatus
  ) => Promise<void>;
  updateAliasCommentMutation: (aliasId: string, comment: string) => Promise<void>;
  accounts: AccountWithAliases[];
  setIsAddAliasModalOpen: (open: boolean) => void;
  setIsAddAccountModalOpen: (open: boolean) => void;
  setIsAccountDetailsModalOpen: (open: boolean) => void;
  setSelectedAccount: (account: AccountWithAliases | null) => void;
  setCurrentAccountId: (id: string | null) => void;
}

export const useHandlers = ({
  addAccountMutation,
  deleteAccountMutation,
  selectAccountMutation,
  addAliasMutation,
  updateAliasStatusMutation,
  updateAliasCommentMutation,
  accounts,
  setIsAddAliasModalOpen,
  setIsAddAccountModalOpen,
  setIsAccountDetailsModalOpen,
  setSelectedAccount,
  setCurrentAccountId,
}: UseHandlersProps) => {
  const handleAddAccount = useCallback(
    async (accountData: {
      primaryEmail: string;
      recoveryEmail: string;
      recoveryPassword: string;
    }) => {
      try {
        await addAccountMutation(accountData);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to create account');
      }
    },
    [addAccountMutation]
  );

  const handleDeleteAccount = useCallback(
    async (accountId: string) => {
      try {
        await deleteAccountMutation(accountId);
      } catch {
        alert('Failed to delete account');
      }
    },
    [deleteAccountMutation]
  );

  const handleSelectAccount = useCallback(
    (accountId: string) => {
      const account = accounts.find((acc) => acc.id === accountId);
      if (account) {
        setSelectedAccount(account);
        setIsAccountDetailsModalOpen(true);
        selectAccountMutation(accountId);
      }
    },
    [accounts, selectAccountMutation, setSelectedAccount, setIsAccountDetailsModalOpen]
  );

  const handleAddAlias = useCallback(
    (accountId: string) => {
      setCurrentAccountId(accountId);
      setIsAddAliasModalOpen(true);
    },
    [setCurrentAccountId, setIsAddAliasModalOpen]
  );

  const handleAddAliasSubmit = useCallback(
    async (email: string, countsTowardLimit: boolean) => {
      const currentAccountId = ''; // Need to get from state
      if (!currentAccountId) return;

      try {
        await addAliasMutation(currentAccountId, email, countsTowardLimit);
        setIsAddAliasModalOpen(false);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to add alias');
      }
    },
    [addAliasMutation, setIsAddAliasModalOpen]
  );

  const handleUpdateAliasStatus = useCallback(
    async (
      aliasId: string,
      service: 'aliexpress' | 'augment',
      status: ServiceStatus
    ) => {
      try {
        await updateAliasStatusMutation(aliasId, service, status);
      } catch {
        alert('Failed to update status');
      }
    },
    [updateAliasStatusMutation]
  );

  const handleUpdateAliasComment = useCallback(
    async (aliasId: string, comment: string) => {
      try {
        await updateAliasCommentMutation(aliasId, comment);
      } catch {
        alert('Failed to update comment');
      }
    },
    [updateAliasCommentMutation]
  );

  return {
    handleAddAccount,
    handleDeleteAccount,
    handleSelectAccount,
    handleAddAlias,
    handleAddAliasSubmit,
    handleUpdateAliasStatus,
    handleUpdateAliasComment,
  };
};