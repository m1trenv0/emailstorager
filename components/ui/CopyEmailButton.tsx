'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface CopyEmailButtonProps {
  email: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon';
  className?: string;
  showText?: boolean;
}

export function CopyEmailButton({
  email,
  variant = 'ghost',
  size = 'icon',
  className = '',
  showText = false,
}: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={`flex-shrink-0 ${className}`}
      title={`Copy ${email}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-600" />
          {showText && <span className="ml-1.5">Copied!</span>}
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {showText && <span className="ml-1.5">Copy</span>}
        </>
      )}
    </Button>
  );
}

