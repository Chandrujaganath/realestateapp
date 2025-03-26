'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { BottomNav } from '@/components/common/navigation/bottom-nav';
import { ClientBottomNav } from '@/components/navigation/client-bottom-nav';
import { GuestBottomNav } from '@/components/navigation/guest-bottom-nav';
import MobileNav from '@/components/navigation/mobile-nav';
import { useAuth } from '@/hooks/use-auth-simple';

// Import only the type for type checking
import type { ExtendedUser } from '@/hooks/use-auth';

export default function ClientNavWrapper() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();
  
  // Only activate on client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  
  // Don't render navigation for auth, login pages, root, and error pages
  const excludedPaths = [
    '/auth',
    '/login',
    '/unauthorized',
    '/verify-email',
    '/reset-password',
    '/',
  ];
  
  if (excludedPaths.some(path => pathname === path || pathname?.startsWith(path))) {
    return null;
  }

  // When still loading, don't render the navigation
  if (loading) return null;

  // Don't render if no user is authenticated
  if (!user) return null;

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