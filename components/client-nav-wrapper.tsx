'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { BottomNav } from '@/components/common/navigation/bottom-nav';
import { ClientBottomNav } from '@/components/navigation/client-bottom-nav';
import { GuestBottomNav } from '@/components/navigation/guest-bottom-nav';
import MobileNav from '@/components/navigation/mobile-nav';
import { useAuth } from '@/hooks/use-auth-simple';

// User type for our application
type User = {
  uid?: string;
  role?: string;
  displayName?: string;
  email?: string;
};

export default function ClientNavWrapper() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();
  
  // Only activate on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  
  // Only exclude auth-related paths
  const excludedPaths = [
    '/auth',
    '/login',
    '/reset-password',
  ];
  
  // Don't show nav on auth pages
  if (excludedPaths.some(path => pathname === path || pathname?.startsWith(path))) {
    return null;
  }

  // When still loading auth status, still show the default nav
  if (loading) {
    return <BottomNav />;
  }

  // If no user is authenticated, show the default bottom nav
  if (!user) {
    return <BottomNav />;
  }

  // Use specific navigation components for different roles
  const role = user.role?.toLowerCase();
  
  if (role === 'client') {
    return <ClientBottomNav />;
  } else if (role === 'guest') {
    return <GuestBottomNav />;
  } else if (role === 'admin' || role === 'superadmin' || role === 'manager') {
    return <MobileNav userRole={role} currentPath={pathname || ''} />;
  }
  
  // Default to the adaptive bottom nav
  return <BottomNav />;
} 