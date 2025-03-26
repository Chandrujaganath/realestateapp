'use client';

import { usePathname } from 'next/navigation';
import type React from 'react';
import { useState, useEffect } from 'react';

import { ImportantAnnouncementBanner } from '@/components/announcements/important-announcement-banner';
import Sidebar from '@/components/navigation/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/features/users/types/user';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const _pathname = usePathname();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkScreenSize();

    // Add event listener
    window.addEventListener('resize', checkScreenSize);

    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Middleware should handle redirect to login
  }

  const userRole = (user?.role || 'client') as UserRole;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-background/80 to-background">
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <Sidebar userRole={userRole as 'client' | 'admin' | 'agent'} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Important announcement banner at the top */}
        <ImportantAnnouncementBanner />

        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">{children}</main>
      </div>
    </div>
  );
}
