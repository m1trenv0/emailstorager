import { useAccountStore } from './useAccountStore';
import { AccountWithAliases } from '@/lib/types';

/**
 * Selectors for derived state from account store
 * Provide stable references for components
 */

/**
 * Get the currently selected account
 */
export const useSelectedAccount = (): AccountWithAliases | undefined =>
  useAccountStore((state) =>
    state.accounts.find((acc) => acc.id === state.selectedAccountId)
  );

/**
 * Get account by ID
 */
export const useAccountById = (id: string): AccountWithAliases | undefined =>
  useAccountStore((state) => state.accounts.find((acc) => acc.id === id));

/**
 * Get all accounts
 * Returns the accounts array for components to compute derived data
 */
export const useAllAccounts = (): AccountWithAliases[] =>
  useAccountStore((state) => state.accounts);

/**
 * Get loading state
 */
export const useAccountsLoading = (): boolean =>
  useAccountStore((state) => state.isLoading);

/**
 * Get error state
 */
export const useAccountsError = (): string | null =>
  useAccountStore((state) => state.error);

/**
 * Get selected account ID
 */
export const useSelectedAccountId = (): string | null =>
  useAccountStore((state) => state.selectedAccountId);
