import React from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-[150px] mb-2" />
          <Skeleton className="h-4 w-[280px]" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-[140px]" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-[120px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-1" />
              <Skeleton className="h-3 w-[80px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[160px] mb-2" />
          <Skeleton className="h-4 w-[240px]" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <Skeleton className="h-10 w-[120px]" />
            <Skeleton className="h-10 w-[120px]" />
            <Skeleton className="h-10 w-[150px]" />
            <div className="ml-auto">
              <Skeleton className="h-10 w-[140px]" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video w-full">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-[80%] mb-1" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-4">
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-4 w-[60px]" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-[80px]" />
                    <Skeleton className="h-8 w-[80px]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
