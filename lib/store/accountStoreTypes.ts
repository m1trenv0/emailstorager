import {
  AccountWithAliases,
  AliasWithStatus,
  ServiceFieldValue,
} from '@/lib/types';

/**
 * State interface for account store
 */
export interface AccountState {
  accounts: AccountWithAliases[];
  selectedAccountId: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Account-level actions
 */
export interface AccountActions {
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
  addServiceToAccount: (
    accountId: string,
    serviceName: string,
    initialFields: Record<string, ServiceFieldValue>
  ) => void;
  removeServiceFromAccount: (accountId: string, serviceName: string) => void;
}

/**
 * Alias-level actions
 */
export interface AliasActions {
  addAlias: (accountId: string, alias: AliasWithStatus) => void;
  updateAliasServiceField: (
    aliasId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => void;
  updateAliasComment: (aliasId: string, comment: string) => void;
  deleteAlias: (aliasId: string) => void;
  addServiceToAlias: (
    aliasId: string,
    serviceName: string,
    initialFields: Record<string, ServiceFieldValue>
  ) => void;
  removeServiceFromAlias: (aliasId: string, serviceName: string) => void;
}

/**
 * Loading and error state actions
 */
export interface StateActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchAccounts: () => Promise<void>;
}

/**
 * Combined store type
 */
export type AccountStore = AccountState &
  AccountActions &
  AliasActions &
  StateActions;

/**
 * Initial store state
 */
export const INITIAL_STATE: AccountState = {
  accounts: [],
  selectedAccountId: null,
  isLoading: false,
  error: null,
};
