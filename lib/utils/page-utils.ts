import { AccountWithAliases, AliasWithStatus } from '@/lib/types';

export function filterAccounts(accounts: AccountWithAliases[], searchQuery: string) {
  return accounts.filter(
    (account) =>
      account.primaryEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.recoveryEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );
}

export function getAllAliases(accounts: AccountWithAliases[]): AliasWithStatus[] {
  return accounts.flatMap((account) => [
    {
      id: account.id,
      accountId: account.id,
      email: account.primaryEmail,
      status: account.status,
      comments: null,
      createdAt: account.createdAt,
      countsTowardLimit: false,
    } as AliasWithStatus,
    ...account.aliases,
  ]);
}
