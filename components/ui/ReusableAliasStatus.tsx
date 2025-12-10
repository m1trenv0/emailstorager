'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';
import { canAddAlias, getTimeUntilNextAlias } from '@/lib/business-logic';
import { AccountWithAliases } from '@/lib/types';

interface ReusableAliasStatusProps {
  account: AccountWithAliases;
  className?: string;
}

export function ReusableAliasStatus({
  account,
  className = '',
}: ReusableAliasStatusProps) {
  const aliasResult = canAddAlias(
    account.lastAliasAddedAt,
    account.aliasesAddedInPeriod
  );
  const timeRemaining = getTimeUntilNextAlias(account.lastAliasAddedAt);

  if (!aliasResult.canAdd && timeRemaining) {
    return (
      <Alert
        variant="default"
        className={`border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950 ${className}`}
      >
        <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          New alias available in {timeRemaining.days}d {timeRemaining.hours}h{' '}
          {timeRemaining.minutes}m (2/2 used)
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert
      variant="default"
      className={`border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 ${className}`}
    >
      <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertDescription className="text-green-800 dark:text-green-200">
        {aliasResult.message}
      </AlertDescription>
    </Alert>
  );
}
