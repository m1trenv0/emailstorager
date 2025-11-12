'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { AccountWithAliases } from '@/lib/types';
import {
  Mail,
  Calendar,
  Copy,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { AliasCard } from './AliasCard';
import { ServiceFieldValue } from '@/lib/types';
import { useConfirm } from '@/lib/hooks/useConfirm';

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountWithAliases | null;
  onAddAlias: (accountId: string) => void;
  onDelete: (accountId: string) => void;
  onServiceFieldUpdate?: (
    aliasId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => Promise<void>;
  onUpdateAliasComment?: (aliasId: string, comment: string) => Promise<void>;
  onAddService?: (aliasId: string, serviceName: string) => Promise<void>;
  onRemoveService?: (aliasId: string, serviceName: string) => Promise<void>;
}

export function AccountDetailsModal({
  isOpen,
  onClose,
  account,
  onAddAlias,
  onDelete,
  onServiceFieldUpdate,
  onUpdateAliasComment,
  onAddService,
  onRemoveService,
}: AccountDetailsModalProps) {
  const [copied, setCopied] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  if (!account) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCredentials = () => {
    const text = `${account.recoveryEmail}:${account.recoveryPassword}`;
    handleCopy(text);
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Account',
      description: `Are you sure you want to delete ${account.primaryEmail} and all its ${account.aliases.length} aliases? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (confirmed) {
      onDelete(account.id);
      onClose();
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canAddAlias = () => {
    const MAX_ALIASES_PER_PERIOD = 2;

    if (!account.lastAliasAddedAt) return true;

    const lastAdded = new Date(account.lastAliasAddedAt);
    const now = new Date();
    const daysSinceLastAlias = Math.floor(
      (now.getTime() - lastAdded.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastAlias >= 7) return true;

    return account.aliasesAddedInPeriod < MAX_ALIASES_PER_PERIOD;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-2xl break-all">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
            <span className="break-all">{account.primaryEmail}</span>
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
              <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">{formatDate(account.createdAt)}</span>
              <span className="sm:hidden">
                {new Date(account.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </span>
            <Badge variant="secondary" className="text-xs">{account.aliases.length} {account.aliases.length === 1 ? 'alias' : 'aliases'}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Recovery Credentials */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recovery Credentials
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-lg border bg-muted/50 p-2.5 sm:p-3.5">
              <code className="min-w-0 flex-1 truncate text-xs sm:text-sm break-all">
                {account.recoveryEmail}:••••••••••••
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCredentials}
                className="cursor-pointer gap-1.5 sm:gap-2 shrink-0 w-full sm:w-auto text-xs"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Actions
            </h3>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1 cursor-pointer text-xs sm:text-sm"
                onClick={() => {
                  onAddAlias(account.id);
                  onClose();
                }}
                disabled={!canAddAlias()}
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
                onClick={handleDelete}
              >
                <Trash2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Delete
              </Button>
            </div>
          </div>

          <Separator />

          {/* Aliases List */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Aliases ({account.aliases.length})
            </h3>
            {account.aliases.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 sm:p-12 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  No aliases yet. Add your first alias to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
                {account.aliases.map((alias) => (
                  <AliasCard
                    key={alias.id}
                    alias={alias}
                    onServiceFieldUpdate={onServiceFieldUpdate}
                    onCommentUpdate={onUpdateAliasComment}
                    onAddService={onAddService}
                    onRemoveService={onRemoveService}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
      <ConfirmDialog />
    </Dialog>
  );
}
