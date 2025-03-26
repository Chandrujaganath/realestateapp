'use client';

import { Home, Building2, MessageSquare, Cog } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

export function GuestBottomNav() {
  const pathname = usePathname();

  const _navItems = [
    {
      label: 'Home',
      href: '/dashboard/guest',
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
    <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-background/80 border-t border-border/40 h-16 z-[100] shadow-md w-full">
      <div className="grid grid-cols-3 h-full">
        {_navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center text-center text-xs space-y-1 transition-colors duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
