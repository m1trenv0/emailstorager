'use client';

import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { formatDateShort } from '@/lib/utils/date-utils';

interface AliasCardHeaderProps {
  email: string;
  createdAt: Date;
  countsTowardLimit: boolean;
}

export function AliasCardHeader({
  email,
  createdAt,
  countsTowardLimit,
}: AliasCardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 space-y-0.5 px-0.5">
        <h4 className="text-sm font-semibold leading-none break-all">{email}</h4>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <time dateTime={new Date(createdAt).toISOString()}>
            {formatDateShort(createdAt)}
          </time>
          {!countsTowardLimit && (
            <Badge variant="secondary" className="text-xs h-4 px-1">
              Not counted
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
