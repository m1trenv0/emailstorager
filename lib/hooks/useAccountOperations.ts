import { useCallback } from 'react';
import { useAccountStore } from '@/lib/store/useAccountStore';
import { ServiceFieldValue } from '@/lib/types';

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

export const useUpdateAccountServiceField = () => {
  const updateAccountServiceField = useAccountStore(
    (state) => state.updateAccountServiceField
  );

  return useCallback(
    async (
      accountId: string,
      serviceName: string,
      fieldName: string,
      value: ServiceFieldValue
    ) => {
      try {
        const requestBody = {
          serviceName,
          fieldName,
          value,
        };

        const response = await fetch(`/api/accounts/${accountId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[useUpdateAccountServiceField] API error:', errorData);
          throw new Error('Failed to update service field');
        }

        const responseData = await response.json();

        updateAccountServiceField(accountId, serviceName, fieldName, value);
      } catch (error) {
        console.error('[useUpdateAccountServiceField] Error updating service field:', error);
        throw error;
      }
    },
    [updateAccountServiceField]
  );
};

export const useAddServiceToAccount = () => {
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);

  return useCallback(
    async (accountId: string, serviceName: string) => {
      try {
        const response = await fetch(`/api/accounts/${accountId}/services`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ serviceName }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to add service');
        }

        // Refresh accounts to get updated account
        await fetchAccounts();
      } catch (error) {
        console.error('Error adding service to account:', error);
        throw error;
      }
    },
    [fetchAccounts]
  );
};

export const useRemoveServiceFromAccount = () => {
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);

  return useCallback(
    async (accountId: string, serviceName: string) => {
      try {
        const response = await fetch(
          `/api/accounts/${accountId}/services/${serviceName}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to remove service');
        }

        // Refresh accounts to get updated account
        await fetchAccounts();
      } catch (error) {
        console.error('Error removing service from account:', error);
        throw error;
      }
    },
    [fetchAccounts]
  );
};
