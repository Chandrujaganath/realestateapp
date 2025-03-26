import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <FileQuestion className="h-16 w-16 text-gray-400 mb-6" />
      <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        We couldn't find the page you're looking for. The page might have been moved, deleted, or
        never existed.
      </p>
      <div className="space-y-4">
        <Button asChild>
          <Link href="/">Go to Homepage</Link>
        </Button>
      </div>
    </div>
  );
}
