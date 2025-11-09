import { Button } from '@/components/ui/button';
import { Plus, Settings, Filter } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onAddAccount: () => void;
}

export const Header = ({ onAddAccount }: HeaderProps) => {
  return (
    <header className="mb-8 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Email Storage Manager</h1>
          <p className="text-muted-foreground">
            Manage your Outlook accounts and aliases with service status
            tracking
          </p>
        </div>
        <Button onClick={onAddAccount}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>
      <nav className="flex gap-2">
        <Link href="/services">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Manage Services
          </Button>
        </Link>
        <Link href="/filters">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Manage Filters
          </Button>
        </Link>
      </nav>
    </header>
  );
};
