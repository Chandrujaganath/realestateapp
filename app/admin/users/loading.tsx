import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
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
                <Skeleton className="h-4 w-full max-w-[80px]" />
                <Skeleton className="h-4 w-full max-w-[100px]" />
                <Skeleton className="h-4 w-full max-w-[50px]" />
              </div>
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex gap-4 py-3">
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                    <Skeleton className="h-4 w-full max-w-[180px]" />
                    <Skeleton className="h-4 w-full max-w-[100px]" />
                    <Skeleton className="h-4 w-full max-w-[80px]" />
                    <Skeleton className="h-4 w-full max-w-[100px]" />
                    <Skeleton className="h-4 w-full max-w-[50px]" />
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 