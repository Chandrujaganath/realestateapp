'use client';

import { Cog, Home, MessageSquare } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface MobileNavProps {
  userRole: string;
  currentPath: string;
}

export default function MobileNav({ userRole, currentPath }: MobileNavProps) {
  // Update navigation items to match global BottomNav component
  const _navItems = [
    {
      label: 'Home',
      href: `/dashboard/${userRole.toLowerCase()}`,
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
    <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-background/80 border-t border-border/40 z-[100] shadow-md w-full">
      <nav className="flex justify-around items-center h-16">
        {_navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center w-full h-full transition-colors duration-200',
              currentPath === item.href ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
            )}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
