'use client';

import type React from 'react';

import DashboardLayout from '@/components/layout/dashboard-layout';
import { useAuth } from '@/hooks/use-auth-simple';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardContent>{children}</DashboardContent>;
}

// Separate component to use auth hook inside the provider
function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Middleware will handle redirect
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
