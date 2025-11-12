'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (account: {
    primaryEmail: string;
    recoveryEmail: string;
    recoveryPassword: string;
  }) => Promise<void>;
}

export function AddAccountModal({
  isOpen,
  onClose,
  onSubmit,
}: AddAccountModalProps) {
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
        toast.error('Invalid credentials format', {
          description: 'Recovery credentials must be in format: email:password',
        });
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
      onClose();
    } catch (error) {
      console.error('Failed to add account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      primaryEmail: '',
      recoveryCredentials: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
          <DialogDescription>
            Create a new email account with primary email and recovery credentials.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primaryEmail">Primary Email</Label>
              <div className="flex items-center gap-2">
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
                  autoFocus
                />
                <span className="shrink-0 text-sm text-muted-foreground">@outlook.com</span>
              </div>
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
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="cursor-pointer">
              {isLoading ? 'Adding...' : 'Add Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
