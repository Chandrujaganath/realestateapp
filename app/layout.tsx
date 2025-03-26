import React from 'react';
import './globals.css';
import { Inter } from 'next/font/google';

import { headers } from 'next/headers';
import { AppProviders } from '@/providers/app-providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Real Estate Management System',
  description: 'A comprehensive system for managing real estate projects',
  generator: 'v0.dev',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Get headers for pathname, but don't use it for rendering decisions
  // This avoids the useAuth error by not accessing context during server-side rendering
  const _headersList = await headers();
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
