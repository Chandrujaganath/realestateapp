'use client';

import { WifiOff } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <WifiOff className="h-16 w-16 text-gray-400 mb-6" />
      <h1 className="text-3xl font-bold mb-2">You're offline</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        It looks like you've lost your internet connection. Some features may be limited until you
        reconnect.
      </p>
      <div className="space-y-4">
        <Button asChild>
          <Link href="/">Go to Homepage</Link>
        </Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
