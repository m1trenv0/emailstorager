import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Email Storage Manager - Secure Outlook Alias Management',
  description:
    'Open-source NextJS application for managing Outlook email accounts and aliases with AliExpress and Augment service status tracking. Self-hosted secure solution with 7-day alias addition limit.',
  keywords: [
    'email management',
    'outlook aliases',
    'aliexpress',
    'augment',
    'email storage',
    'self-hosted',
  ],
  authors: [{ name: 'Email Storage Manager' }],
  creator: 'Email Storage Manager',
  publisher: 'Email Storage Manager',
  openGraph: {
    type: 'website',
    title: 'Email Storage Manager',
    description:
      'Secure self-hosted solution for managing Outlook aliases with service status tracking',
    siteName: 'Email Storage Manager',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
