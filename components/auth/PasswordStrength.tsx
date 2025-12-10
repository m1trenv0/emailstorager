'use client';

import { calculatePasswordStrength } from '@/lib/auth/password-utils';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthProps {
  password: string;
}

const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = [
  'bg-destructive',
  'bg-orange-500',
  'bg-yellow-500',
  'bg-blue-500',
  'bg-green-500',
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const strength = calculatePasswordStrength(password);
  const percentage = (strength / 4) * 100;

  return (
    <div className="space-y-1">
      <Progress value={percentage} className="h-2" />
      <p className="text-xs text-muted-foreground">
        Password strength:{' '}
        <span className="font-medium">{strengthLabels[strength]}</span>
      </p>
    </div>
  );
}
