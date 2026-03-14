'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setupAction } from '@/lib/auth/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type SetupState = {
  success: boolean;
  error?: string;
};

const initialState: SetupState = { success: false };

export function SetupForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    setupAction,
    initialState
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (state.success) {
      toast.success('Admin account created. You can now log in.');
      router.replace('/auth/login');
      return;
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [router, state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Admin name"
          autoComplete="name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin@example.com"
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          value={password}
          onChange={setPassword}
          placeholder="Create a strong password"
          autoComplete="new-password"
          required
        />
        <PasswordStrength password={password} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter password"
          autoComplete="new-password"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Complete setup'
        )}
      </Button>
    </form>
  );
}
