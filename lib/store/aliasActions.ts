import { StateCreator } from 'zustand';
import { AccountStore, AliasActions } from './accountStoreTypes';
import { setServiceField } from '@/lib/service-utils';

/**
 * Creates alias-level actions for the store
 */
export const createAliasActions: StateCreator<
  AccountStore,
  [],
  [],
  AliasActions
> = (set) => ({
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

  addServiceToAlias: (aliasId, serviceName, initialFields) =>
    set((state) => ({
      accounts: state.accounts.map((account) => ({
        ...account,
        aliases: account.aliases.map((alias) =>
          alias.id === aliasId
            ? {
                ...alias,
                status: {
                  ...alias.status,
                  [serviceName]: initialFields,
                },
              }
            : alias
        ),
      })),
    })),

  removeServiceFromAlias: (aliasId, serviceName) =>
    set((state) => ({
      accounts: state.accounts.map((account) => ({
        ...account,
        aliases: account.aliases.map((alias) => {
          if (alias.id !== aliasId) return alias;

          const newStatus = { ...alias.status };
          delete newStatus[serviceName];
          return { ...alias, status: newStatus };
        }),
      })),
    })),
});
