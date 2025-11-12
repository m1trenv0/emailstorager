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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Alias</DialogTitle>
          <DialogDescription>
            Enter the alias email address. Domain defaults to @outlook.com if not specified.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Alias Email</Label>
              <Input
                id="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="username or full email"
                autoFocus
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="countsTowardLimit"
                checked={!countsTowardLimit}
                onCheckedChange={(checked) =>
                  setCountsTowardLimit(!(checked as boolean))
                }
                className="cursor-pointer"
              />
              <Label htmlFor="countsTowardLimit" className="cursor-pointer text-sm font-normal">
                Do not count towards 7 days limit
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" className="cursor-pointer">Add Alias</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
