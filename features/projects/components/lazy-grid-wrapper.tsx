"use client"

import { Suspense, lazy } from "react"
import { GridCell, GridData } from "@/features/projects/types/grid"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Lazy load the grid view component
const ProjectGridViewComponent = lazy(() => 
  import("./project-grid-view").then(mod => ({ default: mod.ProjectGridView }))
)

interface LazyGridWrapperProps {
  projectId: string
  gridData: GridData
  onPlotSelect?: (plotCell: GridCell) => void
}

export function LazyGridWrapper({ projectId, gridData, onPlotSelect }: LazyGridWrapperProps) {
  return (
    <Suspense 
      fallback={
        <Card className="mb-16">
          <CardContent className="flex justify-center items-center py-16">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      }
    >
      <ProjectGridViewComponent 
        projectId={projectId} 
        gridData={gridData} 
        onPlotSelect={onPlotSelect} 
      />
    </Suspense>
  )
} 