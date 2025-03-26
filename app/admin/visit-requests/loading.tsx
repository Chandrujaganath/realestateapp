import React from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-[220px] mb-2" />
          <Skeleton className="h-4 w-[340px]" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-[100px]" />
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
          <Skeleton className="h-6 w-[180px] mb-2" />
          <Skeleton className="h-4 w-[270px]" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <Skeleton className="h-9 w-[100px]" />
              <Skeleton className="h-9 w-[120px]" />
              <Skeleton className="h-9 w-[160px]" />
            </div>
            <Skeleton className="h-9 w-[200px]" />
          </div>

          <div className="rounded-md border">
            <div className="p-4">
              <div className="flex justify-between border-b pb-4 mb-4">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[140px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[60px]" />
              </div>

              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between py-3">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[140px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[60px]" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
