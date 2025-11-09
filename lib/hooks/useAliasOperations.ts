import { useCallback } from 'react';
import { useAccountStore } from '@/lib/store/useAccountStore';
import { ServiceStatus } from '@/lib/types';

export const useAddAlias = () => {
  const addAlias = useAccountStore((state) => state.addAlias);

  return useCallback(
    async (
      accountId: string,
      email: string,
      countsTowardLimit: boolean
    ) => {
      try {
        const response = await fetch(
          `/api/accounts/${accountId}/aliases`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              countsTowardLimit,
            }),
          }
        );

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

export const useUpdateAliasStatus = () => {
  const updateAliasStatus = useAccountStore((state) => state.updateAliasStatus);

  return useCallback(
    async (
      aliasId: string,
      service: 'aliexpress' | 'augment',
      status: ServiceStatus
    ) => {
      try {
        const response = await fetch(`/api/aliases/${aliasId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: { [service]: status },
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update status');
        }

        updateAliasStatus(aliasId, service, status);
      } catch (error) {
        console.error('Error updating status:', error);
        throw error;
      }
    },
    [updateAliasStatus]
  );
};

export const useUpdateAliasComment = () => {
  const updateAliasComment = useAccountStore((state) => state.updateAliasComment);

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