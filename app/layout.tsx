'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { NavigationHeader } from '@/components/NavigationHeader';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { AddAccountModal } from '@/components/AddAccountModal';
import { toast } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  const handleAddAccount = async (accountData: {
    primaryEmail: string;
    recoveryEmail: string;
    recoveryPassword: string;
  }) => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create account');
      }

      setIsAddAccountModalOpen(false);
      toast.success('Account created successfully');
      window.location.reload();
    } catch (error) {
      toast.error('Failed to create account', {
        description:
          error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  return (
    <>
      <main className="container mx-auto min-h-screen p-3 sm:p-6">
        <NavigationHeader
          onAddAccount={
            pathname === '/' ? () => setIsAddAccountModalOpen(true) : undefined
          }
          showAddAccount={pathname === '/'}
        />
        {children}
      </main>
      <AddAccountModal
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
        onSubmit={handleAddAccount}
      />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Email Storage Manager - Secure Outlook Alias Management</title>
        <meta
          name="description"
          content="Open-source NextJS application for managing Outlook email accounts and aliases with AliExpress and Augment service status tracking. Self-hosted secure solution with 7-day alias addition limit."
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LayoutContent>{children}</LayoutContent>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
