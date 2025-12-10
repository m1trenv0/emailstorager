'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail, Calendar } from 'lucide-react';
import { AccountWithAliases } from '@/lib/types';
import { formatDate } from '@/lib/business-logic';

interface AccountCardHeaderProps {
  account: AccountWithAliases;
  isSelected?: boolean;
  onSelect?: (accountId: string) => void;
}

export function AccountCardHeader({
  account,
  isSelected = false,
  onSelect,
}: AccountCardHeaderProps) {
  return (
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
  );
}
