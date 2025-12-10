import { toast } from 'sonner';
import { ServiceFieldValue } from '@/lib/types';
import {
  useAddAccount,
  useDeleteAccount,
  useSelectAccount,
  useUpdateAccountServiceField,
  useAddServiceToAccount,
  useRemoveServiceFromAccount,
} from '@/lib/hooks/useAccountOperations';
import {
  useAddAlias,
  useUpdateAliasServiceField,
  useUpdateAliasComment,
  useAddServiceToAlias,
  useRemoveServiceFromAlias,
} from '@/lib/hooks/useAliasOperations';

export function usePageHandlers() {
  const addAccountMutation = useAddAccount();
  const deleteAccountMutation = useDeleteAccount();
  const selectAccountMutation = useSelectAccount();
  const updateAccountServiceFieldMutation = useUpdateAccountServiceField();
  const addServiceToAccountMutation = useAddServiceToAccount();
  const removeServiceFromAccountMutation = useRemoveServiceFromAccount();
  const addAliasMutation = useAddAlias();
  const updateAliasServiceFieldMutation = useUpdateAliasServiceField();
  const updateAliasCommentMutation = useUpdateAliasComment();
  const addServiceToAliasMutation = useAddServiceToAlias();
  const removeServiceFromAliasMutation = useRemoveServiceFromAlias();

  const handleAddAccount = async (accountData: {
    primaryEmail: string;
    recoveryEmail: string;
    recoveryPassword: string;
  }) => {
    try {
      await addAccountMutation(accountData);
      toast.success('Account created successfully');
    } catch (error) {
      toast.error('Failed to create account', {
        description:
          error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await deleteAccountMutation(accountId);
      toast.success('Account deleted successfully');
    } catch {
      toast.error('Failed to delete account');
    }
  };

  const handleSelectAccount = (
    accountId: string,
    onSelect: (accountId: string) => void
  ) => {
    onSelect(accountId);
    selectAccountMutation(accountId);
  };

  const handleUpdateAliasServiceField = async (
    aliasId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => {
    try {
      await updateAliasServiceFieldMutation(
        aliasId,
        serviceName,
        fieldName,
        value
      );
    } catch {
      toast.error('Failed to update service field');
    }
  };

  const handleUpdateAliasComment = async (aliasId: string, comment: string) => {
    try {
      await updateAliasCommentMutation(aliasId, comment);
    } catch {
      toast.error('Failed to update comment');
    }
  };

  const handleAddServiceToAlias = async (
    aliasId: string,
    serviceName: string
  ) => {
    try {
      await addServiceToAliasMutation(aliasId, serviceName);
      toast.success('Service added successfully');
    } catch (error) {
      toast.error('Failed to add service', {
        description:
          error instanceof Error ? error.message : 'An error occurred',
      });
      throw error;
    }
  };

  const handleRemoveServiceFromAlias = async (
    aliasId: string,
    serviceName: string
  ) => {
    try {
      await removeServiceFromAliasMutation(aliasId, serviceName);
      toast.success('Service removed successfully');
    } catch {
      toast.error('Failed to remove service');
    }
  };

  const handleUpdateAccountServiceField = async (
    accountId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => {
    try {
      await updateAccountServiceFieldMutation(
        accountId,
        serviceName,
        fieldName,
        value
      );
    } catch {
      toast.error('Failed to update account service field');
    }
  };

  const handleAddServiceToAccount = async (
    accountId: string,
    serviceName: string
  ) => {
    try {
      await addServiceToAccountMutation(accountId, serviceName);
      toast.success('Service added to account successfully');
    } catch (error) {
      toast.error('Failed to add service to account', {
        description:
          error instanceof Error ? error.message : 'An error occurred',
      });
      throw error;
    }
  };

  const handleRemoveServiceFromAccount = async (
    accountId: string,
    serviceName: string
  ) => {
    try {
      await removeServiceFromAccountMutation(accountId, serviceName);
      toast.success('Service removed from account successfully');
    } catch {
      toast.error('Failed to remove service from account');
    }
  };

  const handleAddAlias = async (
    accountId: string,
    email: string,
    countsTowardLimit: boolean
  ) => {
    try {
      await addAliasMutation(accountId, email, countsTowardLimit);
      toast.success('Alias added successfully');
    } catch (error) {
      toast.error('Failed to add alias', {
        description:
          error instanceof Error ? error.message : 'An error occurred',
      });
      throw error;
    }
  };

  return {
    handleAddAccount,
    handleDeleteAccount,
    handleSelectAccount,
    handleUpdateAliasServiceField,
    handleUpdateAliasComment,
    handleAddServiceToAlias,
    handleRemoveServiceFromAlias,
    handleUpdateAccountServiceField,
    handleAddServiceToAccount,
    handleRemoveServiceFromAccount,
    handleAddAlias,
  };
}
