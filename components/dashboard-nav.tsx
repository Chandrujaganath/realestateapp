'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  children: React.ReactNode;
}

function NavItem({ href, children }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center px-4 py-2 text-sm font-medium rounded-md',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      )}
    >
      {children}
    </Link>
  );
}

export function DashboardNav() {
  return (
    <nav className="space-y-1">
      <NavItem href="/dashboard">Dashboard</NavItem>
      <NavItem href="/dashboard/projects">Projects</NavItem>
      <NavItem href="/dashboard/tasks">Tasks</NavItem>
      <NavItem href="/dashboard/clients">Clients</NavItem>
      <NavItem href="/dashboard/settings">Settings</NavItem>
    </nav>
  );
}

