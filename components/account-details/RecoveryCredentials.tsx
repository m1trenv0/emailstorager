'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2 } from 'lucide-react';

interface RecoveryCredentialsProps {
  email: string;
  password: string;
}

export function RecoveryCredentials({ email, password }: RecoveryCredentialsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `${email}:${password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="space-y-2 sm:space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Recovery Credentials
      </h3>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-lg border bg-muted/50 p-2.5 sm:p-3.5">
        <code className="min-w-0 flex-1 truncate text-xs sm:text-sm break-all">
          {email}:••••••••••••
        </code>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
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
    </section>
  );
}
