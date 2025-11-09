import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface HeaderProps {
  onAddAccount: () => void;
}

export const Header = ({ onAddAccount }: HeaderProps) => {
  return (
    <header className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
      <div>
        <h1 className="mb-2 text-4xl font-bold">Email Storage Manager</h1>
        <p className="text-muted-foreground">
          Manage your Outlook accounts and aliases with service status tracking
        </p>
      </div>
      <Button onClick={onAddAccount} className="ml-4">
        <Plus className="mr-2 h-4 w-4" />
        Add Account
      </Button>
    </header>
  );
};
