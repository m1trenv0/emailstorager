import { useCallback } from 'react';
import { useAccountStore } from '@/lib/store/useAccountStore';
import { ServiceFieldValue } from '@/lib/types';
import { useCSRFToken } from '@/lib/hooks/useCSRFToken';

export const useAddAlias = () => {
  const addAlias = useAccountStore((state) => state.addAlias);
  const { getCSRFHeaders, ensureTokenLoaded } = useCSRFToken();

  return useCallback(
    async (accountId: string, email: string, countsTowardLimit: boolean) => {
      try {
        await ensureTokenLoaded();
        const response = await fetch(`/api/accounts/${accountId}/aliases`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getCSRFHeaders(),
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
    [addAlias, getCSRFHeaders, ensureTokenLoaded]
  );
};

export const useUpdateAliasServiceField = () => {
  const updateAliasServiceField = useAccountStore(
    (state) => state.updateAliasServiceField
  );
  const { getCSRFHeaders, ensureTokenLoaded } = useCSRFToken();

  return useCallback(
    async (
      aliasId: string,
      serviceName: string,
      fieldName: string,
      value: ServiceFieldValue
    ) => {
      // Ensure CSRF token is loaded before proceeding
      await ensureTokenLoaded();

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
            ...getCSRFHeaders(),
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
    [updateAliasServiceField, getCSRFHeaders, ensureTokenLoaded]
  );
};

export const useUpdateAliasComment = () => {
  const updateAliasComment = useAccountStore(
    (state) => state.updateAliasComment
  );
  const { getCSRFHeaders, ensureTokenLoaded } = useCSRFToken();

  return useCallback(
    async (aliasId: string, comment: string) => {
      // Ensure CSRF token is loaded before proceeding
      await ensureTokenLoaded();

      try {
        const response = await fetch(`/api/aliases/${aliasId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getCSRFHeaders(),
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
    [updateAliasComment, getCSRFHeaders, ensureTokenLoaded]
  );
};

export const useAddServiceToAlias = () => {
  const addServiceToAlias = useAccountStore((state) => state.addServiceToAlias);
  const { getCSRFHeaders, ensureTokenLoaded } = useCSRFToken();

  return useCallback(
    async (aliasId: string, serviceName: string) => {
      try {
        await ensureTokenLoaded();
        const response = await fetch(`/api/aliases/${aliasId}/services`, {
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

        const updatedAlias = await response.json();
        console.log('[useAddServiceToAlias] Updated alias:', updatedAlias);
        console.log('[useAddServiceToAlias] Service name:', serviceName);

        // Update store with the service fields from the response
        const serviceFields = updatedAlias.status[serviceName];
        console.log('[useAddServiceToAlias] Service fields:', serviceFields);

        if (serviceFields) {
          addServiceToAlias(aliasId, serviceName, serviceFields);
        } else {
          console.error('[useAddServiceToAlias] No service fields found for', serviceName);
        }
      } catch (error) {
        console.error('Error adding service to alias:', error);
        throw error;
      }
    },
    [addServiceToAlias, getCSRFHeaders, ensureTokenLoaded]
  );
};

export const useRemoveServiceFromAlias = () => {
  const removeServiceFromAlias = useAccountStore((state) => state.removeServiceFromAlias);
  const { getCSRFHeaders, ensureTokenLoaded } = useCSRFToken();

  return useCallback(
    async (aliasId: string, serviceName: string) => {
      try {
        await ensureTokenLoaded();
        const response = await fetch(
          `/api/aliases/${aliasId}/services/${serviceName}`,
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
        removeServiceFromAlias(aliasId, serviceName);
      } catch (error) {
        console.error('Error removing service from alias:', error);
        throw error;
      }
    },
    [removeServiceFromAlias, getCSRFHeaders, ensureTokenLoaded]
  );
};
