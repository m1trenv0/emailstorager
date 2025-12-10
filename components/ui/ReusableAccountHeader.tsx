'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Mail } from 'lucide-react';
import { formatDate } from '@/lib/business-logic';

interface ReusableAccountHeaderProps {
  email: string;
  createdAt: Date;
  aliasCount?: number;
  title?: string;
  className?: string;
}

export function ReusableAccountHeader({
  email,
  createdAt,
  aliasCount = 0,
  title,
  className = '',
}: ReusableAccountHeaderProps) {
  return (
    <CardHeader className={className}>
      {title && <CardTitle className="text-sm font-medium">{title}</CardTitle>}
      <div className="flex items-start justify-between gap-2 lg:gap-3">
        <div className="space-y-1 min-w-0 flex-1 overflow-hidden">
          <div className="flex items-center gap-2 text-base sm:text-lg lg:text-xl font-semibold">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">{email}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">Created: {formatDate(createdAt)}</span>
          </div>
        </div>
        {aliasCount > 0 && (
          <Badge
            variant="secondary"
            className="flex-shrink-0 whitespace-nowrap text-xs lg:text-sm self-start mt-0.5"
          >
            {aliasCount}
          </Badge>
        )}
      </div>
    </CardHeader>
  );
}
