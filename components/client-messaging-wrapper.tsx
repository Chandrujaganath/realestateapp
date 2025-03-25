'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/use-auth';

// Use dynamic import with no SSR and error boundary
const FirebaseMessagingComponent = dynamic(
  () => import('@/components/firebase-messaging').then(mod => mod.FirebaseMessaging),
  { 
    ssr: false,
    loading: () => null,
  }
);

// Create a wrapper component that ensures auth is available
export default function ClientMessagingWrapper() {
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Always call hooks at the top level, regardless of conditions
  let auth;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    auth = useAuth();
  } catch (err) {
    if (err instanceof Error) {
      setError(err);
    } else {
      setError(new Error('Unknown auth error'));
    }
    console.error("Error using auth in ClientMessagingWrapper:", err);
  }
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything if there's an error or we're not on the client
  if (error || !isClient || !auth?.user) {
    return null;
  }
  
  // If we get here, we have a client-side render with an authenticated user
  return <FirebaseMessagingComponent />;
} 