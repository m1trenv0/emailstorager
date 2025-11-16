import { AccountCard } from '@/components/AccountCard';
import { AccountWithAliases } from '@/lib/types';

interface AllAccountsTabProps {
  filteredAccounts: AccountWithAliases[];
  onAddAlias: (accountId: string) => void;
  onDelete: (accountId: string) => void;
  onSelect: (accountId: string) => void;
  selectedAccountId: string | null;
}

export const AllAccountsTab = ({
  filteredAccounts,
  onAddAlias,
  onDelete,
  onSelect,
  selectedAccountId,
}: AllAccountsTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredAccounts.length === 0 ? (
        <div className="col-span-full">
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground">
              No accounts found. Add your first account to get started.
            </p>
          </div>
        </div>
      ) : (
        filteredAccounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onAddAlias={onAddAlias}
            onDelete={onDelete}
            onSelect={onSelect}
            isSelected={selectedAccountId === account.id}
          />
        ))
      )}
    </div>
  );
};
