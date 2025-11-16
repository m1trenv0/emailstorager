import { useCallback } from 'react';
import { useAccountStore } from '@/lib/store/useAccountStore';
import { ServiceFieldValue } from '@/lib/types';

export const useAddAlias = () => {
  const addAlias = useAccountStore((state) => state.addAlias);

  return useCallback(
    async (accountId: string, email: string, countsTowardLimit: boolean) => {
      try {
        const response = await fetch(`/api/accounts/${accountId}/aliases`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            countsTowardLimit,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to add alias');
        }

        const newAlias = await response.json();
        addAlias(accountId, newAlias);
      } catch (error) {
        console.error('Error adding alias:', error);
        throw error;
      }
    },
    [addAlias]
  );
};

export const useUpdateAliasServiceField = () => {
  const updateAliasServiceField = useAccountStore(
    (state) => state.updateAliasServiceField
  );

  return useCallback(
    async (
      aliasId: string,
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

        const response = await fetch(`/api/aliases/${aliasId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[useUpdateAliasServiceField] API error:', errorData);
          throw new Error('Failed to update service field');
        }

        const responseData = await response.json();

        updateAliasServiceField(aliasId, serviceName, fieldName, value);
      } catch (error) {
        console.error('[useUpdateAliasServiceField] Error updating service field:', error);
        throw error;
      }
    },
    [updateAliasServiceField]
  );
};

export const useUpdateAliasComment = () => {
  const updateAliasComment = useAccountStore(
    (state) => state.updateAliasComment
  );

  return useCallback(
    async (aliasId: string, comment: string) => {
      try {
        const response = await fetch(`/api/aliases/${aliasId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comments: comment }),
        });

        if (!response.ok) {
          throw new Error('Failed to update comment');
        }

        updateAliasComment(aliasId, comment);
      } catch (error) {
        console.error('Error updating comment:', error);
        throw error;
      }
    },
    [updateAliasComment]
  );
};

export const useAddServiceToAlias = () => {
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);

  return useCallback(
    async (aliasId: string, serviceName: string) => {
      try {
        const response = await fetch(`/api/aliases/${aliasId}/services`, {
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

        // Refresh accounts to get updated alias
        await fetchAccounts();
      } catch (error) {
        console.error('Error adding service to alias:', error);
        throw error;
      }
    },
    [fetchAccounts]
  );
};

export const useRemoveServiceFromAlias = () => {
  const fetchAccounts = useAccountStore((state) => state.fetchAccounts);

  return useCallback(
    async (aliasId: string, serviceName: string) => {
      try {
        const response = await fetch(
          `/api/aliases/${aliasId}/services/${serviceName}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to remove service');
        }

        // Refresh accounts to get updated alias
        await fetchAccounts();
      } catch (error) {
        console.error('Error removing service from alias:', error);
        throw error;
      }
    },
    [fetchAccounts]
  );
};
