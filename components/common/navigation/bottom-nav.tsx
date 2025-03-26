'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Home, Cog, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
};

// Simplify to exactly 3 items as discussed
const _navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/dashboard',
    icon: Home,
    roles: ['client', 'guest', 'manager', 'admin', 'superadmin'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Cog,
    roles: ['client', 'guest', 'manager', 'admin', 'superadmin'],
  },
  {
    label: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    roles: ['client', 'guest', 'manager', 'admin', 'superadmin'],
  },
];

// List of paths where bottom nav should not be shown
const _excludedPaths = [
  '/auth/login',
  '/auth/register',
  '/auth/register-client',
  '/auth/register-guest',
  '/auth/register-as-client',
  '/auth/register-as-guest',
  '/unauthorized',
  '/verify-email',
  '/reset-password',
  // Remove any dashboard paths from exclusion
];

export function BottomNav() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Only show after component is mounted client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Early return if component is not mounted
  if (!mounted) return null;

  // Use generic links for unauthenticated users
  const genericItems = [
    {
      label: 'Home',
      href: '/dashboard',
      icon: Home,
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Cog,
    },
    {
      label: 'Messages',
      href: '/messages',
      icon: MessageSquare,
    },
  ];

  return (
    <AnimatePresence>
      <motion.nav
        className="fixed bottom-0 left-0 right-0 z-[9999] backdrop-blur-md bg-background/80 border-t border-border/40 h-16 shadow-md w-full"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
          {genericItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname && (pathname === item.href || pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex flex-col items-center justify-center px-5 transition-colors duration-200',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                )}
                aria-label={item.label}
              >
                {Icon &&
                  React.createElement(Icon as React.ComponentType<any>, {
                    className: cn(
                      'w-5 h-5 mb-1 transition-colors duration-200',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    ),
                  })}
                <span
                  className={cn(
                    'text-xs transition-colors duration-200',
                    isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </motion.nav>
    </AnimatePresence>
  );
}
