import React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-[150px] mb-2" />
          <Skeleton className="h-4 w-[300px]" />
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
          <Skeleton className="h-6 w-[180px] mb-2" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
            <Skeleton className="h-10 w-full md:w-64" />
            <Skeleton className="h-10 w-full md:w-64" />
            <Skeleton className="h-10 w-24 ml-auto" />
          </div>
          
          <div className="rounded-md border">
            <div className="p-4">
              <div className="flex gap-4 border-b pb-4 mb-4">
                <Skeleton className="h-4 w-full max-w-[120px]" />
                <Skeleton className="h-4 w-full max-w-[180px]" />
                <Skeleton className="h-4 w-full max-w-[100px]" />
                <Skeleton className="h-4 w-full max-w-[120px]" />
                <Skeleton className="h-4 w-full max-w-[100px]" />
                <Skeleton className="h-4 w-full max-w-[70px]" />
              </div>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex gap-4 py-3">
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                    <Skeleton className="h-4 w-full max-w-[180px]" />
                    <Skeleton className="h-4 w-full max-w-[100px]" />
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                    <Skeleton className="h-4 w-full max-w-[100px]" />
                    <Skeleton className="h-4 w-full max-w-[70px]" />
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

