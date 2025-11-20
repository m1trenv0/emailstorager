'use client';

import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { AccountWithAliases } from '@/lib/types';
import { canAddAlias } from '@/lib/business-logic';

interface AccountActionsProps {
  account: AccountWithAliases;
  onAddAlias?: (accountId: string) => void;
  onDelete?: (accountId: string) => void;
}

export function AccountActions({ account, onAddAlias, onDelete }: AccountActionsProps) {
  const { confirm, ConfirmDialog } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Account',
      description: `Are you sure you want to delete ${account.primaryEmail}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (confirmed) {
      onDelete?.(account.id);
    }
  };

  const canAddAliasResult = canAddAlias(account.lastAliasAddedAt, account.aliasesAddedInPeriod);

  return (
    <>
      <section className="flex gap-2">
        <Button
          className="flex-1"
          onClick={(e) => {
            e.stopPropagation();
            onAddAlias?.(account.id);
          }}
          disabled={!canAddAliasResult.canAdd}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Alias
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </section>
      <ConfirmDialog />
    </>
  );
}