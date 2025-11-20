'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AccountWithAliases } from '@/lib/types';
import { AccountCardHeader } from '@/components/AccountCard/AccountCardHeader';
import { AccountRecoveryInfo } from '@/components/AccountCard/AccountRecoveryInfo';
import { AliasStatusAlert } from '@/components/AccountCard/AliasStatusAlert';
import { AccountActions } from '@/components/AccountCard/AccountActions';

interface AccountCardProps {
  account: AccountWithAliases;
  onAddAlias?: (accountId: string) => void;
  onDelete?: (accountId: string) => void;
  onSelect?: (accountId: string) => void;
  isSelected?: boolean;
}

export function AccountCard({
  account,
  onAddAlias,
  onDelete,
  onSelect,
  isSelected = false,
}: AccountCardProps) {
  return (
    <article
      className={`w-full cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect?.(account.id)}
    >
      <Card>
        <AccountCardHeader
          account={account}
          isSelected={isSelected}
          onSelect={onSelect}
        />
        <CardContent className="flex flex-col space-y-4">
          {/* Recovery Information */}
          <AccountRecoveryInfo account={account} />

          <Separator />

          {/* Alias Addition Status */}
          <section className="space-y-2 flex-1">
            <AliasStatusAlert account={account} />
          </section>

          {/* Action Buttons */}
          <AccountActions
            account={account}
            onAddAlias={onAddAlias}
            onDelete={onDelete}
          />
        </CardContent>
      </Card>
    </article>
  );
}
