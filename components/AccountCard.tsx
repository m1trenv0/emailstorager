'use client';

import { useState } from 'react';
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
import { AccountWithAliases } from '@/lib/types';
import { Mail, Key, Calendar, Clock, Plus, Trash2 } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);

  const canAddAlias = () => {
    if (!account.lastAliasAddedAt) return true;

    const lastAdded = new Date(account.lastAliasAddedAt);
    const now = new Date();
    const daysSinceLastAlias = Math.floor(
      (now.getTime() - lastAdded.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceLastAlias >= 7;
  };

  const getTimeUntilNextAlias = () => {
    if (!account.lastAliasAddedAt) return null;

    const lastAdded = new Date(account.lastAliasAddedAt);
    const nextAvailable = new Date(lastAdded);
    nextAvailable.setDate(nextAvailable.getDate() + 7);

    const now = new Date();
    const diff = nextAvailable.getTime() - now.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const timeRemaining = getTimeUntilNextAlias();

  return (
    <Card
      className={`w-full cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect?.(account.id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Mail className="h-5 w-5" />
              {account.primaryEmail}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Created: {formatDate(account.createdAt)}
            </CardDescription>
          </div>
          <Badge variant="secondary">{account.aliases.length} aliases</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recovery Information */}
        <section className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Recovery:</span>
              <span>{account.recoveryEmail}</span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2 text-sm">
              <Key className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Password:</span>
              <span className="font-mono">
                {showPassword ? account.recoveryPassword : '••••••••'}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setShowPassword(!showPassword);
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </Button>
          </div>
        </section>

        <Separator />

        {/* Alias Addition Status */}
        <section className="space-y-2">
          {timeRemaining ? (
            <div className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm dark:border-yellow-900 dark:bg-yellow-950">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-yellow-800 dark:text-yellow-200">
                New alias available in {timeRemaining.days}d{' '}
                {timeRemaining.hours}h {timeRemaining.minutes}m
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm dark:border-green-900 dark:bg-green-950">
              <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-200">
                Ready to add new alias
              </span>
            </div>
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
            onClick={(e) => {
              e.stopPropagation();
              if (
                confirm(
                  `Are you sure you want to delete ${account.primaryEmail}?`
                )
              ) {
                onDelete?.(account.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </section>
      </CardContent>
    </Card>
  );
}
