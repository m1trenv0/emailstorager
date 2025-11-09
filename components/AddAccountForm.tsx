'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AddAccountFormProps {
  onSubmit: (account: {
    primaryEmail: string;
    recoveryEmail: string;
    recoveryPassword: string;
  }) => Promise<void>;
}

export function AddAccountForm({ onSubmit }: AddAccountFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    primaryEmail: '',
    recoveryCredentials: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Parse recovery credentials (email:password format)
      const [recoveryEmail, recoveryPassword] =
        formData.recoveryCredentials.split(':');

      if (!recoveryEmail || !recoveryPassword) {
        alert('Recovery credentials must be in format: email:password');
        setIsLoading(false);
        return;
      }

      // Auto-append @outlook.com to primary email if not present
      const primaryEmail = formData.primaryEmail.includes('@')
        ? formData.primaryEmail
        : `${formData.primaryEmail}@outlook.com`;

      await onSubmit({
        primaryEmail,
        recoveryEmail,
        recoveryPassword,
      });
      setFormData({
        primaryEmail: '',
        recoveryCredentials: '',
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to add account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} size="lg" className="w-full">
        <Plus className="mr-2 h-5 w-5" />
        Add New Account
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryEmail">Primary Email</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="primaryEmail"
                type="text"
                placeholder="username"
                value={formData.primaryEmail}
                onChange={(e) =>
                  setFormData({ ...formData, primaryEmail: e.target.value })
                }
                required
                className="flex-1"
              />
              <span className="text-muted-foreground">@outlook.com</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter username only (e.g., &quot;myusername&quot; →
              myusername@outlook.com)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recoveryCredentials">Recovery Credentials</Label>
            <Input
              id="recoveryCredentials"
              type="text"
              placeholder="recovery@example.com:password123"
              value={formData.recoveryCredentials}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  recoveryCredentials: e.target.value,
                })
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              Format: email:password (e.g., recovery@gmail.com:mypassword)
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Account'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
