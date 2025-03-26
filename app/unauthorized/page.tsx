'use client';

import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth-simple';

export default function UnauthorizedPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Function to redirect user to their appropriate dashboard
  const goToDashboard = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

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
        router.push('/');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <ShieldAlert className="h-16 w-16 text-red-500 mb-6" />
      <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
      <p className="text-lg mb-6">You don't have permission to access this page.</p>
      <Button onClick={goToDashboard}>Go to your dashboard</Button>
    </div>
  );
}
