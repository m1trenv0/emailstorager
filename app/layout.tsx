'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { NavigationHeader } from '@/components/NavigationHeader';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { AddAccountModal } from '@/components/AddAccountModal';
import { toast } from 'sonner';
import { HeaderProvider, useHeader } from '@/lib/context/HeaderContext';
import { useCSRFToken } from '@/lib/hooks/useCSRFToken';

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
  const { customAction } = useHeader();
  const { getCSRFHeaders, ensureTokenLoaded } = useCSRFToken();

  const handleAddAccount = async (accountData: {
    primaryEmail: string;
    recoveryEmail: string;
    recoveryPassword: string;
  }) => {
    try {
      // Ensure CSRF token is loaded
      await ensureTokenLoaded();

      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getCSRFHeaders(),
        },
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

  // Check if we're on an auth page
  const isAuthPage = pathname.startsWith('/auth');

  return (
    <>
      <main className="container mx-auto min-h-screen p-3 sm:p-6">
        {!isAuthPage && (
          <NavigationHeader
            onAddAccount={
              pathname === '/'
                ? () => setIsAddAccountModalOpen(true)
                : undefined
            }
            showAddAccount={pathname === '/'}
            customAction={customAction}
          />
        )}
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0070f3" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="EmailStore" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HeaderProvider>
          <LayoutContent>{children}</LayoutContent>
        </HeaderProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
