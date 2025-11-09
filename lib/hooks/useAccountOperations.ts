import { useCallback } from 'react';
import { useAccountStore } from '@/lib/store/useAccountStore';

export const useAddAccount = () => {
  const addAccount = useAccountStore((state) => state.addAccount);

  return useCallback(
    async (accountData: {
      primaryEmail: string;
      recoveryEmail: string;
      recoveryPassword: string;
    }) => {
      try {
        const response = await fetch('/api/accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(accountData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create account');
        }

        const newAccount = await response.json();
        addAccount(newAccount);
      } catch (error) {
        console.error('Error adding account:', error);
        throw error; // Re-throw to let component handle
      }
    },
    [addAccount]
  );
};

export const useDeleteAccount = () => {
  const deleteAccount = useAccountStore((state) => state.deleteAccount);

  return useCallback(
    async (accountId: string) => {
      try {
        const response = await fetch(`/api/accounts/${accountId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete account');
        }

        deleteAccount(accountId);
      } catch (error) {
        console.error('Error deleting account:', error);
        throw error;
      }
    },
    [deleteAccount]
  );
};

export const useSelectAccount = () => {
  const selectAccount = useAccountStore((state) => state.selectAccount);

  return useCallback(
    (accountId: string) => {
      selectAccount(accountId);
    },
    [selectAccount]
  );
};