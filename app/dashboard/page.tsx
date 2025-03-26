'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user, redirect to login
        router.push('/auth/login');
      } else {
        // Redirect based on role
        const role = user.role?.toLowerCase();
        switch (role) {
          case 'admin':
            router.push('/dashboard/admin');
            break;
          case 'superadmin':
            router.push('/dashboard/superadmin');
            break;
          case 'manager':
            router.push('/dashboard/manager');
            break;
          case 'client':
            router.push('/dashboard/client');
            break;
          case 'guest':
            router.push('/dashboard/guest');
            break;
          default:
            router.push('/unauthorized');
        }
      }
    }
  }, [user, loading, router]);

  // Show loading screen while checking user role
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-center text-muted-foreground">Redirecting to your dashboard...</p>
    </div>
  );
}
