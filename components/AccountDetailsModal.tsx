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
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Mail className="h-6 w-6" />
            {account.primaryEmail}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4 text-base">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Created {formatDate(account.createdAt)}
            </span>
            <Badge variant="secondary">{account.aliases.length} aliases</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recovery Credentials */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Recovery Credentials
            </h3>
            <div className="flex items-center justify-between rounded-lg border bg-muted p-4">
              <p className="font-mono text-base break-all">
                {account.recoveryEmail}:••••••••••••
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCredentials}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </section>

          <Separator />

          {/* Actions */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Actions
            </h3>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1"
                onClick={() => {
                  onAddAlias(account.id);
                  onClose();
                }}
                disabled={!canAddAlias()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Alias
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(`https://outlook.com`, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Outlook
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </section>

          <Separator />

          {/* Aliases List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Aliases ({account.aliases.length})
              </h3>
            </div>
            {account.aliases.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No aliases yet. Add your first alias to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
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
          </section>
        </div>
      </DialogContent>
      <ConfirmDialog />
    </Dialog>
  );
}
