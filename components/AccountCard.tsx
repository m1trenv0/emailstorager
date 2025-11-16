'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AccountWithAliases } from '@/lib/types';
import { Mail, Calendar, Clock, Plus, Trash2, Copy } from 'lucide-react';
import { useConfirm } from '@/lib/hooks/useConfirm';

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
  const { confirm, ConfirmDialog } = useConfirm();

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${account.recoveryEmail}:${account.recoveryPassword}`
    );
  };

  const canAddAlias = () => {
    const MAX_ALIASES_PER_PERIOD = 2;

    if (!account.lastAliasAddedAt) return true;

    const lastAdded = new Date(account.lastAliasAddedAt);
    const now = new Date();
    const daysSinceLastAlias = Math.floor(
      (now.getTime() - lastAdded.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If 7 days have passed, reset counter
    if (daysSinceLastAlias >= 7) return true;

    // Check if we have aliases remaining in current period
    return account.aliasesAddedInPeriod < MAX_ALIASES_PER_PERIOD;
  };

  const getTimeUntilNextAlias = () => {
    const MAX_ALIASES_PER_PERIOD = 2;

    if (!account.lastAliasAddedAt) return null;

    const lastAdded = new Date(account.lastAliasAddedAt);
    const now = new Date();
    const daysSinceLastAlias = Math.floor(
      (now.getTime() - lastAdded.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If 7 days have passed or we have aliases remaining, no timer needed
    if (
      daysSinceLastAlias >= 7 ||
      account.aliasesAddedInPeriod < MAX_ALIASES_PER_PERIOD
    )
      return null;

    const nextAvailable = new Date(lastAdded);
    nextAvailable.setDate(nextAvailable.getDate() + 7);

    const diff = nextAvailable.getTime() - now.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  const getAliasesRemaining = () => {
    const MAX_ALIASES_PER_PERIOD = 2;

    if (!account.lastAliasAddedAt) return MAX_ALIASES_PER_PERIOD;

    const lastAdded = new Date(account.lastAliasAddedAt);
    const now = new Date();
    const daysSinceLastAlias = Math.floor(
      (now.getTime() - lastAdded.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If 7 days have passed, reset counter
    if (daysSinceLastAlias >= 7) return MAX_ALIASES_PER_PERIOD;

    return Math.max(0, MAX_ALIASES_PER_PERIOD - account.aliasesAddedInPeriod);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const timeRemaining = getTimeUntilNextAlias();
  const aliasesRemaining = getAliasesRemaining();

  return (
    <Card
      className={`w-full cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect?.(account.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 lg:gap-3">
          <div className="space-y-1 min-w-0 flex-1 overflow-hidden">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">{account.primaryEmail}</span>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-xs">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">
                Created: {formatDate(account.createdAt)}
              </span>
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className="flex-shrink-0 whitespace-nowrap text-xs lg:text-sm self-start mt-0.5"
          >
            {account.aliases.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        {/* Recovery Information */}
        <section className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2 text-xs">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono truncate max-w-[12rem]">
                {account.recoveryEmail}:••••••••
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </section>

        <Separator />

        {/* Alias Addition Status */}
        <section className="space-y-2 flex-1">
          {timeRemaining ? (
            <Alert
              variant="default"
              className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950"
            >
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                New alias available in {timeRemaining.days}d{' '}
                {timeRemaining.hours}h {timeRemaining.minutes}m (2/2 used)
              </AlertDescription>
            </Alert>
          ) : (
            <Alert
              variant="default"
              className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
            >
              <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Ready to add new alias ({aliasesRemaining}/2 available)
              </AlertDescription>
            </Alert>
          )}
        </section>

        {/* Action Buttons */}
        <section className="flex gap-2">
          <Button
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onAddAlias?.(account.id);
            }}
            disabled={!canAddAlias()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Alias
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={async (e) => {
              e.stopPropagation();
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
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </section>
      </CardContent>
      <ConfirmDialog />
    </Card>
  );
}
