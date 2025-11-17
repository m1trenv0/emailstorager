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

      try {
        const requestBody = {
          serviceName,
          fieldName,
          value,
        };

        console.log(
          `[useUpdateAccountServiceField] Sending PATCH request to /api/accounts/${accountId} with body:`,
          requestBody
        );

        const startTime = Date.now();
        const response = await fetch(`/api/accounts/${accountId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        const fetchTime = Date.now() - startTime;

        console.log(
          `[useUpdateAccountServiceField] Fetch completed in ${fetchTime}ms, response status: ${response.status}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[useUpdateAccountServiceField] API error response:', {
            status: response.status,
            statusText: response.statusText,
            errorData,
            accountId,
            serviceName,
            fieldName,
            value,
          });
          throw new Error('Failed to update service field');
        }

        const responseData = await response.json();
        console.log(
          `[useUpdateAccountServiceField] API response data:`,
          responseData
        );

        console.log(
          `[useUpdateAccountServiceField] Updating store with new value`
        );
        updateAccountServiceField(accountId, serviceName, fieldName, value);

        console.log(
          `[useUpdateAccountServiceField] Update completed successfully for ${serviceName}.${fieldName}`
        );
      } catch (error) {
        console.error(
          '[useUpdateAccountServiceField] Error updating service field:',
          {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            accountId,
            serviceName,
            fieldName,
            value,
          }
        );
        throw error;
      }
    },
    [updateAccountServiceField]
  );
};

export const useAddServiceToAccount = () => {
  const addServiceToAccount = useAccountStore(
    (state) => state.addServiceToAccount
  );

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
    [addServiceToAccount]
  );
};

export const useRemoveServiceFromAccount = () => {
  const removeServiceFromAccount = useAccountStore(
    (state) => state.removeServiceFromAccount
  );

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

        // Update store immediately
        removeServiceFromAccount(accountId, serviceName);
      } catch (error) {
        console.error('Error removing service from account:', error);
        throw error;
      }
    },
    [removeServiceFromAccount]
  );
};
