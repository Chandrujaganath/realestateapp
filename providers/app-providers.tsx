"use client";

import React, { Suspense } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import dynamic from "next/dynamic";

// Use dynamic import with error boundaries for client-only messaging component
const ClientMessagingWrapper = dynamic(
  () => import("@/components/client-messaging-wrapper"),
  { 
    ssr: false,
    loading: () => null
  }
);

// Simple error boundary for messaging component to prevent app crashes
function MessagingErrorBoundary({ children }: { children: React.ReactNode }) {
  if (typeof window === 'undefined') return null;
  
  try {
    return <>{children}</>;
  } catch (error) {
    console.error("Messaging component error:", error);
    return null;
  }
}

/**
 * Root providers that wrap the entire application
 * This component provides all the context providers needed app-wide
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        {children}
        <Suspense fallback={null}>
          <MessagingErrorBoundary>
            <ClientMessagingWrapper />
          </MessagingErrorBoundary>
        </Suspense>
      </AuthProvider>
      <Toaster />
    </ThemeProvider>
  );
} 