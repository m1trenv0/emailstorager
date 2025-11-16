import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  AccountWithAliases,
  AliasWithStatus,
  ServiceFieldValue,
} from '@/lib/types';
import { setServiceField } from '@/lib/service-utils';

interface AccountState {
  accounts: AccountWithAliases[];
  selectedAccountId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AccountActions {
  // Account actions
  setAccounts: (accounts: AccountWithAliases[]) => void;
  addAccount: (account: AccountWithAliases) => void;
  updateAccount: (id: string, account: Partial<AccountWithAliases>) => void;
  deleteAccount: (id: string) => void;
  selectAccount: (id: string | null) => void;
  updateAccountServiceField: (
    accountId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => void;

  // Alias actions
  addAlias: (accountId: string, alias: AliasWithStatus) => void;
  updateAliasServiceField: (
    aliasId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => void;
  updateAliasComment: (aliasId: string, comment: string) => void;
  deleteAlias: (aliasId: string) => void;

  // Loading and error states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Fetch data
  fetchAccounts: () => Promise<void>;
}

type AccountStore = AccountState & AccountActions;

export const useAccountStore = create<AccountStore>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        accounts: [],
        selectedAccountId: null,
        isLoading: false,
        error: null,

        // Account actions
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

        // Alias actions
        addAlias: (accountId, alias) =>
          set((state) => ({
            accounts: state.accounts.map((account) =>
              account.id === accountId
                ? {
                    ...account,
                    aliases: [...account.aliases, alias],
                    lastAliasAddedAt: new Date(),
                  }
                : account
            ),
          })),

        updateAliasServiceField: (aliasId, serviceName, fieldName, value) =>
          set((state) => ({
            accounts: state.accounts.map((account) => ({
              ...account,
              aliases: account.aliases.map((alias) =>
                alias.id === aliasId
                  ? {
                      ...alias,
                      status: setServiceField(
                        alias.status,
                        serviceName,
                        fieldName,
                        value
                      ),
                    }
                  : alias
              ),
            })),
          })),

        updateAliasComment: (aliasId, comment) =>
          set((state) => ({
            accounts: state.accounts.map((account) => ({
              ...account,
              aliases: account.aliases.map((alias) =>
                alias.id === aliasId ? { ...alias, comments: comment } : alias
              ),
            })),
          })),

        deleteAlias: (aliasId) =>
          set((state) => ({
            accounts: state.accounts.map((account) => ({
              ...account,
              aliases: account.aliases.filter((alias) => alias.id !== aliasId),
            })),
          })),

        // Loading and error states
        setLoading: (loading) => set({ isLoading: loading }),

        setError: (error) => set({ error }),

        // Fetch data from API
        fetchAccounts: async () => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch('/api/accounts');
            if (!response.ok) {
              throw new Error('Failed to fetch accounts');
            }
            const data = await response.json();
            set({ accounts: data, isLoading: false });
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error.message
                  : 'Unknown error occurred',
              isLoading: false,
            });
          }
        },
      }),
      {
        name: 'account-storage',
        partialize: (state) => ({
          accounts: state.accounts,
          selectedAccountId: state.selectedAccountId,
        }),
      }
    ),
    { name: 'AccountStore' }
  )
);

// Selectors for derived state - return stable references
export const useSelectedAccount = (): AccountWithAliases | undefined =>
  useAccountStore((state) =>
    state.accounts.find((acc) => acc.id === state.selectedAccountId)
  );

export const useAccountById = (id: string): AccountWithAliases | undefined =>
  useAccountStore((state) => state.accounts.find((acc) => acc.id === id));

// For collections, return the accounts array and let components compute derived data
export const useAllAccounts = (): AccountWithAliases[] =>
  useAccountStore((state) => state.accounts);
