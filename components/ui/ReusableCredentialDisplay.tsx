'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Copy } from 'lucide-react';

interface ReusableCredentialDisplayProps {
  email: string;
  password: string;
  title?: string;
  className?: string;
}

export function ReusableCredentialDisplay({
  email,
  password,
  title = 'Recovery Credentials',
  className = '',
}: ReusableCredentialDisplayProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(`${email}:${password}`);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
          <div className="flex items-center gap-2 text-xs">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono truncate max-w-[12rem]">
              {email}:•••••••••
            </span>
          </div>
          <Button size="sm" variant="ghost" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
