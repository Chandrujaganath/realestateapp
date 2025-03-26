'use client';

import { Bell, Calendar, AlertTriangle, Info, MessageSquare } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { _useAnnouncements } from '@/hooks/use-announcements';
import { Announcement } from '@/types/announcement';

export function UserAnnouncements() {
  // Return null immediately to prevent any announcements from showing
  return null;
}

function AnnouncementsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Bell className="h-5 w-5" />
        <h2 className="text-xl font-bold">Announcements</h2>
      </div>

      {Array(2)
        .fill(0)
        .map((_, _i) => (
          <Card
            key={i}
            className="glass-card overflow-hidden border-l-4"
            style={{ borderLeftColor: 'rgb(156, 163, 175)' }}
          >
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
