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
    recoveryEmail: '',
    recoveryPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        primaryEmail: '',
        recoveryEmail: '',
        recoveryPassword: '',
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
            <Input
              id="primaryEmail"
              type="email"
              placeholder="user@example.com"
              value={formData.primaryEmail}
              onChange={(e) =>
                setFormData({ ...formData, primaryEmail: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recoveryEmail">Recovery Email</Label>
            <Input
              id="recoveryEmail"
              type="email"
              placeholder="recovery@example.com"
              value={formData.recoveryEmail}
              onChange={(e) =>
                setFormData({ ...formData, recoveryEmail: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recoveryPassword">Recovery Password</Label>
            <Input
              id="recoveryPassword"
              type="text"
              placeholder="Enter recovery password"
              value={formData.recoveryPassword}
              onChange={(e) =>
                setFormData({ ...formData, recoveryPassword: e.target.value })
              }
              required
            />
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
