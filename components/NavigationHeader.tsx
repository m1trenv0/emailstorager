'use client';

import { Button } from '@/components/ui/button';
import { Plus, Settings, Filter, Home, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from 'sonner';

interface NavigationHeaderProps {
  onAddAccount?: () => void;
  showAddAccount?: boolean;
  customAction?: React.ReactNode;
}

export const NavigationHeader = ({
  onAddAccount,
  showAddAccount = false,
  customAction,
}: NavigationHeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      toast.success('Logged out successfully');
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      toast.error('Failed to logout');
      console.error('Logout error:', error);
    }
  };

  const getPageTitle = () => {
    if (pathname === '/') return 'Email Storage Manager';
    if (pathname === '/services') return 'Service Management';
    if (pathname === '/filters') return 'Filter Management';
    return 'Email Storage Manager';
  };

  const getPageDescription = () => {
    if (pathname === '/')
      return 'Manage your Outlook accounts and aliases with service status tracking';
    if (pathname === '/services')
      return 'Create and manage dynamic service configurations';
    if (pathname === '/filters')
      return 'Create and manage filters for your services';
    return '';
  };

  return (
    <header className="mb-6 sm:mb-8 flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div className="min-h-[60px] sm:min-h-0">
          <h1 className="mb-1.5 sm:mb-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight transition-all duration-300">
            {getPageTitle()}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground transition-all duration-300">
            {getPageDescription()}
          </p>
        </div>
        <div className="flex gap-2 min-h-[40px]">
          {showAddAccount && onAddAccount && (
            <Button onClick={onAddAccount} className="w-full sm:w-auto transition-all duration-200">
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          )}
          {customAction}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
      <nav className="flex gap-2 flex-wrap min-h-[36px]">
        <Link href="/" className="flex-1 sm:flex-none">
          <Button
            variant={pathname === '/' ? 'default' : 'outline'}
            size="sm"
            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Accounts</span>
            <span className="sm:hidden">Home</span>
          </Button>
        </Link>
        <Link href="/services" className="flex-1 sm:flex-none">
          <Button
            variant={pathname === '/services' ? 'default' : 'outline'}
            size="sm"
            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Settings className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Manage Services</span>
            <span className="sm:hidden">Services</span>
          </Button>
        </Link>
        <Link href="/filters" className="flex-1 sm:flex-none">
          <Button
            variant={pathname === '/filters' ? 'default' : 'outline'}
            size="sm"
            className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Filter className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Manage Filters</span>
            <span className="sm:hidden">Filters</span>
          </Button>
        </Link>
      </nav>
    </header>
  );
};
