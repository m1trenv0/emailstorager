import { StateCreator } from 'zustand';
import { AccountStore, AccountActions } from './accountStoreTypes';
import { setServiceField } from '@/lib/service-utils';

/**
 * Creates account-level actions for the store
 */
export const createAccountActions: StateCreator<
  AccountStore,
  [],
  [],
  AccountActions
> = (set) => ({
  setAccounts: (accounts) => set({ accounts }),

  addAccount: (account) =>
    set((state) => ({
      accounts: [...state.accounts, account],
    })),

  updateAccount: (id, updatedAccount) =>
    set((state) => ({
      accounts: state.accounts.map((account) =>
        account.id === id ? { ...account, ...updatedAccount } : account
      ),
    })),

  deleteAccount: (id) =>
    set((state) => ({
      accounts: state.accounts.filter((account) => account.id !== id),
      selectedAccountId:
        state.selectedAccountId === id ? null : state.selectedAccountId,
    })),

  selectAccount: (id) => set({ selectedAccountId: id }),

  updateAccountServiceField: (accountId, serviceName, fieldName, value) =>
    set((state) => ({
      accounts: state.accounts.map((account) =>
        account.id === accountId
          ? {
              ...account,
              status: setServiceField(
                account.status,
                serviceName,
                fieldName,
                value
              ),
            }
          : account
      ),
    })),

  addServiceToAccount: (accountId, serviceName, initialFields) =>
    set((state) => ({
      accounts: state.accounts.map((account) =>
        account.id === accountId
          ? {
              ...account,
              status: {
                ...account.status,
                [serviceName]: initialFields,
              },
            }
          : account
      ),
    })),

  removeServiceFromAccount: (accountId, serviceName) =>
    set((state) => ({
      accounts: state.accounts.map((account) => {
        if (account.id !== accountId) return account;

        const newStatus = { ...account.status };
        delete newStatus[serviceName];
        return { ...account, status: newStatus };
      }),
    })),
});
