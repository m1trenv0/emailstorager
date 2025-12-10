'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SetupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);

  useEffect(() => {
    // Check if setup is required
    const checkSetup = async () => {
      try {
        const response = await fetch('/api/auth/check-setup');
        const data = await response.json();

        if (!data.setupRequired) {
          // If setup is not required, redirect to login
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Failed to check setup status:', error);
      } finally {
        setIsCheckingSetup(false);
      }
    };

    checkSetup();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      toast.success('Account created successfully');
      router.push('/');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create account'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingSetup) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to Email Storage Manager</CardTitle>
        <CardDescription>
          Create your admin account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoComplete="username"
              minLength={3}
              maxLength={50}
              pattern="[a-zA-Z0-9_-]+"
            />
            <p className="text-xs text-muted-foreground">
              3-50 characters, letters, numbers, underscores and hyphens only
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Enter password"
              autoComplete="new-password"
            />
            <PasswordStrength password={password} />
            <p className="text-xs text-muted-foreground">
              Minimum 12 characters with uppercase, lowercase, numbers, and
              special characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Confirm password"
              autoComplete="new-password"
            />
          </div>

          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-medium mb-1">Important:</p>
            <p className="text-muted-foreground">
              If you forget your password, you will need direct access to your
              MongoDB database to reset it. Please store your credentials
              securely.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !username || !password || !confirmPassword}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
