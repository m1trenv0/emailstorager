import { Button } from '@/components/ui/button';
import { Plus, Settings, Filter } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onAddAccount: () => void;
}

export const Header = ({ onAddAccount }: HeaderProps) => {
  return (
    <header className="mb-6 sm:mb-8 flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div>
          <h1 className="mb-1.5 sm:mb-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Email Storage Manager
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your Outlook accounts and aliases with service status
            tracking
          </p>
        </div>
        <Button onClick={onAddAccount} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>
      <nav className="flex gap-2 flex-wrap">
        <Link href="/services" className="flex-1 sm:flex-none">
          <Button variant="outline" size="sm" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Manage Services</span>
            <span className="sm:hidden">Services</span>
          </Button>
        </Link>
        <Link href="/filters" className="flex-1 sm:flex-none">
          <Button variant="outline" size="sm" className="w-full">
            <Filter className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Manage Filters</span>
            <span className="sm:hidden">Filters</span>
          </Button>
        </Link>
      </nav>
    </header>
  );
};
