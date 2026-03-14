'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/lib/auth/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type LoginState = {
  success: boolean;
  error?: string;
};

const initialState: LoginState = { success: false };

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (state.success) {
      toast.success('Logged in successfully');
      router.replace('/');
      return;
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [router, state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
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
          placeholder="Enter password"
          autoComplete="current-password"
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          name="rememberMe"
          className="h-4 w-4 accent-primary"
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
        />
        Remember me on this device
      </label>

      <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
        Forgot your password? You&apos;ll need direct access to your database to
        reset it.
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </Button>
    </form>
  );
}
