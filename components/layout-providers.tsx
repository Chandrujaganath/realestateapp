'use client';

import dynamic from 'next/dynamic';
import React from 'react';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

// Use dynamic import with client wrapper for Firebase messaging
const ClientMessagingWrapper = dynamic(() => import('@/components/client-messaging-wrapper'), {
  ssr: false,
});

// Import auth provider with client-only approach
const ClientAuthWrapper = dynamic(() => import('@/components/client-auth-wrapper'), {
  ssr: false,
});

export default function LayoutProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ClientAuthWrapper>
        {children}
        <ClientMessagingWrapper />
      </ClientAuthWrapper>
      <Toaster />
    </ThemeProvider>
  );
}
