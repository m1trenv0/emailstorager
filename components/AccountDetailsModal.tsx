'use client';

import { useState, useEffect } from 'react';
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
import { AccountWithAliases, Service } from '@/lib/types';
import {
  Mail,
  Calendar,
  Copy,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
  Edit2,
} from 'lucide-react';
import { AliasCard } from './AliasCard';
import { ServiceFieldValue } from '@/lib/types';
import { useConfirm } from '@/lib/hooks/useConfirm';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ServiceFieldEditor } from './ServiceFieldEditor';
import { AddServiceToAliasDialog } from './AddServiceToAliasDialog';
import { useFetch } from '@/lib/hooks/useFetch';

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
  onAccountServiceFieldUpdate?: (
    accountId: string,
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => Promise<void>;
  onAddServiceToAccount?: (accountId: string, serviceName: string) => Promise<void>;
  onRemoveServiceFromAccount?: (accountId: string, serviceName: string) => Promise<void>;
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
  onAccountServiceFieldUpdate,
  onAddServiceToAccount,
  onRemoveServiceFromAccount,
}: AccountDetailsModalProps) {
  const [copied, setCopied] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();
  const [isAddServiceDialogOpen, setIsAddServiceDialogOpen] = useState(false);
  const [isAccountServicesOpen, setIsAccountServicesOpen] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: availableServices } = useFetch<Service[]>('/api/services', {
    cache: true,
    cacheTTL: 30000,
  });

  const services = availableServices || [];

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

  const handleAccountFieldUpdate = async (
    serviceName: string,
    fieldName: string,
    value: ServiceFieldValue
  ) => {
    if (!onAccountServiceFieldUpdate) return;
    setIsUpdating(true);
    try {
      await onAccountServiceFieldUpdate(account.id, serviceName, fieldName, value);
    } catch (error) {
      console.error('Failed to update account service field:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddServiceToAccount = async (serviceName: string) => {
    if (!onAddServiceToAccount) return;
    setIsUpdating(true);
    try {
      await onAddServiceToAccount(account.id, serviceName);
    } catch (error) {
      console.error('Failed to add service to account:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveServiceFromAccount = async (serviceName: string) => {
    if (!onRemoveServiceFromAccount) return;
    const confirmed = await confirm({
      title: 'Remove Service',
      description: `Are you sure you want to remove ${serviceName} from this account?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'destructive',
    });
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      await onRemoveServiceFromAccount(account.id, serviceName);
    } catch (error) {
      console.error('Failed to remove service from account:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderAccountServiceEditor = (serviceName: string) => {
    if (services.length === 0) return null;
    const service = services.find((s) => s.name === serviceName);
    if (!service) return null;

    const accountStatus =
      typeof account.status === 'object' && account.status !== null
        ? (account.status as Record<string, Record<string, ServiceFieldValue>>)
        : {};
    const currentValues = accountStatus[serviceName] || {};
    const isEditing = editingService === serviceName;

    return (
      <div key={serviceName} className="rounded border bg-card">
        <div className="p-2 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="text-xs capitalize shrink-0">
              {serviceName}
            </Badge>
            <div className="flex items-center gap-1 shrink-0">
              {!isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 shrink-0"
                    onClick={() => setEditingService(serviceName)}
                    disabled={isUpdating}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    <span className="text-xs">Edit</span>
                  </Button>
                  {onRemoveServiceFromAccount && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveServiceFromAccount(serviceName)}
                      disabled={isUpdating}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </>
              ) : null}
            </div>
          </div>

          <ServiceFieldEditor
            serviceName={serviceName}
            serviceFields={service.fields}
            currentValues={currentValues}
            onUpdate={async (fieldName, value) =>
              await handleAccountFieldUpdate(serviceName, fieldName, value)
            }
            onEditStart={() => setEditingService(serviceName)}
            onEditComplete={() => setEditingService(null)}
            isEditing={isEditing}
            isUpdating={isUpdating}
            renderEditButton={isEditing}
            renderFieldsOnly={true}
            onRemoveService={
              onRemoveServiceFromAccount
                ? () => handleRemoveServiceFromAccount(serviceName)
                : undefined
            }
          />
        </div>
      </div>
    );
  };

  const accountStatus =
    typeof account.status === 'object' && account.status !== null
      ? (account.status as Record<string, Record<string, ServiceFieldValue>>)
      : {};
  const accountServices = Object.keys(accountStatus);

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

          {/* Account Services Section */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Account Services
            </h3>
            <Collapsible
              open={isAccountServicesOpen}
              onOpenChange={setIsAccountServicesOpen}
            >
              <div className="flex items-center justify-between">
                <CollapsibleTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-70">
                    <ChevronDown
                      className="h-3 w-3 transition-transform"
                      style={{
                        transform: isAccountServicesOpen
                          ? 'rotate(0deg)'
                          : 'rotate(-90deg)',
                      }}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      Services ({accountServices.length})
                    </span>
                  </div>
                </CollapsibleTrigger>
                {onAddServiceToAccount && isAccountServicesOpen && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0"
                    onClick={() => setIsAddServiceDialogOpen(true)}
                    disabled={isUpdating}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <CollapsibleContent className="mt-2 space-y-2">
                {accountServices.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic px-2">
                    No services added to this account yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {accountServices.map((serviceName) =>
                      renderAccountServiceEditor(serviceName)
                    )}
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
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
      {/* Add Service to Account Dialog */}
      <AddServiceToAliasDialog
        isOpen={isAddServiceDialogOpen}
        onClose={() => setIsAddServiceDialogOpen(false)}
        onSubmit={handleAddServiceToAccount}
        availableServices={services}
        existingServices={accountServices}
      />
    </Dialog>
  );
}
