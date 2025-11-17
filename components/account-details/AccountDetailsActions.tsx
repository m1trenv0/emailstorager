'use client';

import { Button } from '@/components/ui/button';
import { Plus, ExternalLink, Trash2 } from 'lucide-react';

interface AccountDetailsActionsProps {
  accountId: string;
  canAddAlias: boolean;
  onAddAlias: (accountId: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function AccountDetailsActions({
  accountId,
  canAddAlias,
  onAddAlias,
  onDelete,
  onClose,
}: AccountDetailsActionsProps) {
  return (
    <section className="space-y-2 sm:space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Actions
      </h3>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          className="flex-1 cursor-pointer text-xs sm:text-sm"
          onClick={() => {
            onAddAlias(accountId);
            onClose();
          }}
          disabled={!canAddAlias}
        >
          <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Add Alias
        </Button>
        <Button
          variant="outline"
          className="flex-1 cursor-pointer text-xs sm:text-sm"
          onClick={() => window.open(`https://outlook.com`, '_blank')}
        >
          <ExternalLink className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Outlook
        </Button>
        <Button
          variant="destructive"
          className="flex-1 cursor-pointer text-xs sm:text-sm"
          onClick={onDelete}
        >
          <Trash2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Delete
        </Button>
      </div>
    </section>
  );
}
