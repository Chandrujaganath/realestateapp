import React from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-[190px] mb-2" />
          <Skeleton className="h-4 w-[320px]" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-[150px]" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-[110px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-1" />
              <Skeleton className="h-3 w-[90px]" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[170px] mb-2" />
          <Skeleton className="h-4 w-[260px]" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <Skeleton className="h-10 w-[120px]" />
            <Skeleton className="h-10 w-[140px]" />
            <Skeleton className="h-10 w-[160px]" />
            <div className="ml-auto">
              <Skeleton className="h-10 w-[180px]" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-[150px] mb-1" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-[90%] mb-2" />
                  <Skeleton className="h-4 w-[60%] mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-[60px]" />
                    <Skeleton className="h-8 w-[60px]" />
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
