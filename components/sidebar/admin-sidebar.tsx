'use client';

import React from 'react';
import {
  Building2,
  Users,
  Calendar,
  Bell,
  BarChart3,
  Settings,
  Home,
  ClipboardList,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className, ...props }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const _toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const _items = [
    {
      title: 'Dashboard',
      href: '/dashboard/admin',
      icon: Home,
    },
    {
      title: 'Projects',
      href: '/admin/projects',
      icon: Building2,
    },
    {
      title: 'Users',
      href: '/admin/users',
      icon: Users,
    },
    {
      title: 'Visit Requests',
      href: '/admin/visit-requests',
      icon: Calendar,
    },
    {
      title: 'Leave Requests',
      href: '/admin/leave-requests',
      icon: ClipboardList,
    },
    {
      title: 'Announcements',
      href: '/admin/announcements',
      icon: Bell,
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
    {
      title: 'Attendance',
      href: '/admin/attendance',
      icon: Clock,
    },
    {
      title: 'Managers',
      href: '/admin/managers',
      icon: Users,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  return (
    <div
      className={cn(
        'flex flex-col border-r bg-background/60 backdrop-blur-md',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
      {...props}
    >
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && <span className="text-lg font-semibold">Admin Panel</span>}
        <Button
          variant="ghost"
          size="icon"
          className={cn('ml-auto', collapsed && 'mx-auto')}
          onClick={toggleSidebar}
        >
          {collapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-right"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-chevron-left"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                pathname === item.href || pathname?.startsWith(item.href + '/')
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
