'use client';

import { Button } from '@/components/ui/button';
import { Mail, Copy } from 'lucide-react';
import { AccountWithAliases } from '@/lib/types';

interface AccountRecoveryInfoProps {
  account: AccountWithAliases;
}

export function AccountRecoveryInfo({ account }: AccountRecoveryInfoProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${account.recoveryEmail}:${account.recoveryPassword}`
    );
  };

  return (
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
  );
}