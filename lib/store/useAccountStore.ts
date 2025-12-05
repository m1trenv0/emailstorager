import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AccountStore, INITIAL_STATE } from './accountStoreTypes';
import { createAccountActions } from './accountActions';
import { createAliasActions } from './aliasActions';

/**
 * Main account store
 * Combines account and alias actions with persistence
 */
export const useAccountStore = create<AccountStore>()(
  devtools(
    persist(
      (set, get, store) => ({
        // Initial state
        ...INITIAL_STATE,

        // Account actions
        ...createAccountActions(set, get, store),

        // Alias actions
        ...createAliasActions(set, get, store),

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

// Re-export selectors for backwards compatibility
export {
  useSelectedAccount,
  useAccountById,
  useAllAccounts,
  useAccountsLoading,
  useAccountsError,
  useSelectedAccountId,
} from './accountSelectors';
