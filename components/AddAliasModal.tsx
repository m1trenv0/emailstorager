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
import { Checkbox } from '@/components/ui/checkbox';

interface AddAliasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, countsTowardLimit: boolean) => void;
}

export function AddAliasModal({
  isOpen,
  onClose,
  onSubmit,
}: AddAliasModalProps) {
  const [emailInput, setEmailInput] = useState('');
  const [countsTowardLimit, setCountsTowardLimit] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    // Auto-append @outlook.com if no @ is present
    const email = emailInput.includes('@')
      ? emailInput
      : `${emailInput}@outlook.com`;

    onSubmit(email, countsTowardLimit);
    setEmailInput('');
    setCountsTowardLimit(true);
    onClose();
  };

  const handleClose = () => {
    setEmailInput('');
    setCountsTowardLimit(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Alias</DialogTitle>
          <DialogDescription>
            Enter the alias email address. If you do not include a domain,
            @outlook.com will be appended automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="username or full email"
                className="col-span-3"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-1"></div>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="countsTowardLimit"
                  checked={!countsTowardLimit}
                  onCheckedChange={(checked) =>
                    setCountsTowardLimit(!(checked as boolean))
                  }
                />
                <Label htmlFor="countsTowardLimit" className="text-sm">
                  Do not count towards 7 days limit
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Add Alias</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
