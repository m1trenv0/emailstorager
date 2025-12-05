import { useCallback } from 'react';
import { useAccountStore } from '@/lib/store/useAccountStore';
import { ServiceFieldValue } from '@/lib/types';
import { useCSRFToken } from '@/lib/hooks/useCSRFToken';

export const useAddAccount = () => {
  const addAccount = useAccountStore((state) => state.addAccount);
  const { getCSRFHeaders, ensureTokenLoaded } = useCSRFToken();

  return useCallback(
    async (accountData: {
      primaryEmail: string;
      recoveryEmail: string;
      recoveryPassword: string;
    }) => {
      // Ensure CSRF token is loaded before proceeding
      await ensureTokenLoaded();

      try {
        const response = await fetch('/api/accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getCSRFHeaders(),
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
    [addAccount, getCSRFHeaders, ensureTokenLoaded]
  );
};

export const useDeleteAccount = () => {
  const deleteAccount = useAccountStore((state) => state.deleteAccount);
  const { getCSRFHeaders, ensureTokenLoaded } = useCSRFToken();

  return useCallback(
    async (accountId: string) => {
      // Ensure CSRF token is loaded before proceeding
      await ensureTokenLoaded();

      try {
        const response = await fetch(`/api/accounts/${accountId}`, {
          method: 'DELETE',
          headers: {
            ...getCSRFHeaders(),
          },
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
    [deleteAccount, getCSRFHeaders, ensureTokenLoaded]
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
  const { getCSRFHeaders, ensureTokenLoaded, refreshToken } = useCSRFToken();

  return useCallback(
    async (
      accountId: string,
      serviceName: string,
      fieldName: string,
      value: ServiceFieldValue
    ) => {
      console.log(
        `[useUpdateAccountServiceField] Starting update for account ${accountId}, service ${serviceName}, field ${fieldName}:`,
        {
          accountId,
          serviceName,
          fieldName,
          value: JSON.stringify(value),
          valueType: typeof value,
        }
      );

      await ensureTokenLoaded();

      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getCSRFHeaders(),
        },
        body: JSON.stringify({ serviceName, fieldName, value }),
      });

      try {
        if (!response.ok) {
          let errorData: unknown;
          try {
            errorData = await response.json();
          } catch {
            errorData = await response.text();
          }
          
          // If CSRF token is invalid, refresh it for next request
          if (response.status === 403) {
            await refreshToken();
          }
          
          console.error('[useUpdateAccountServiceField] API error response:', 
            `status=${response.status}`,
            `statusText=${response.statusText}`,
            `errorData=${JSON.stringify(errorData)}`,
            `accountId=${accountId}`,
            `serviceName=${serviceName}`,
            `fieldName=${fieldName}`,
            `value=${JSON.stringify(value)}`
          );
          throw new Error(`Failed to update service field: ${response.status} - ${JSON.stringify(errorData)}`);
        }

        const responseData = await response.json();

        updateAccountServiceField(accountId, serviceName, fieldName, value);
      } catch (error) {
        console.error(
          '[useUpdateAccountServiceField] Error updating service field:',
          `error=${error instanceof Error ? error.message : String(error)}`,
          `accountId=${accountId}`,
          `serviceName=${serviceName}`,
          `fieldName=${fieldName}`,
          `value=${JSON.stringify(value)}`
        );
        throw error;
      }
    },
    [updateAccountServiceField, getCSRFHeaders, ensureTokenLoaded, refreshToken]
  );
};

export const useAddServiceToAccount = () => {
  const addServiceToAccount = useAccountStore(
    (state) => state.addServiceToAccount
  );
  const { getCSRFHeaders, ensureTokenLoaded } = useCSRFToken();

  return useCallback(
    async (accountId: string, serviceName: string) => {
      try {
        await ensureTokenLoaded();
        const response = await fetch(`/api/accounts/${accountId}/services`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getCSRFHeaders(),
          },
          body: JSON.stringify({ serviceName }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to add service');
        }

        const updatedAccount = await response.json();
        console.log(
          '[useAddServiceToAccount] Updated account:',
          updatedAccount
        );
        console.log('[useAddServiceToAccount] Service name:', serviceName);
        console.log('[useAddServiceToAccount] Status:', updatedAccount.status);

        // Update store with the service fields from the response
        const serviceFields = updatedAccount.status[serviceName];
        console.log('[useAddServiceToAccount] Service fields:', serviceFields);

        if (serviceFields) {
          addServiceToAccount(accountId, serviceName, serviceFields);
        } else {
          console.error(
            '[useAddServiceToAccount] No service fields found for',
            serviceName
          );
        }
      } catch (error) {
        console.error('Error adding service to account:', error);
        throw error;
      }
    },
    [addServiceToAccount, getCSRFHeaders, ensureTokenLoaded]
  );
};

export const useRemoveServiceFromAccount = () => {
  const removeServiceFromAccount = useAccountStore(
    (state) => state.removeServiceFromAccount
  );
  const { getCSRFHeaders, ensureTokenLoaded } = useCSRFToken();

  return useCallback(
    async (accountId: string, serviceName: string) => {
      try {
        await ensureTokenLoaded();
        const response = await fetch(
          `/api/accounts/${accountId}/services/${serviceName}`,
          {
            method: 'DELETE',
            headers: {
              ...getCSRFHeaders(),
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to remove service');
        }

        // Update store immediately
        removeServiceFromAccount(accountId, serviceName);
      } catch (error) {
        console.error('Error removing service from account:', error);
        throw error;
      }
    },
    [removeServiceFromAccount, getCSRFHeaders, ensureTokenLoaded]
  );
};
