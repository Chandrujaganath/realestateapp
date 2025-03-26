import { Building2 } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background/80 to-background">
      <header className="container mx-auto px-4 py-6">
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Plot App </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="glass-card w-full max-w-md p-8">{children}</div>
      </main>

      <footer className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Real Estate Management System. All rights reserved.
      </footer>
    </div>
  );
}
