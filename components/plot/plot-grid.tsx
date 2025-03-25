"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type PlotStatus = "available" | "booked" | "sold" | "reserved" | "unavailable"

export interface Plot {
  id: string
  number: string
  status: PlotStatus
  size?: string
  price?: number
  description?: string
}

interface PlotGridProps {
  projectId: string
  plots: Plot[]
  rows: number
  columns: number
  onPlotSelect?: (plot: Plot) => void
}

export default function PlotGrid({ projectId, plots, rows, columns, onPlotSelect }: PlotGridProps) {
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const router = useRouter()

  // Create a 2D grid from the plots array
  const grid: (Plot | null)[][] = Array(rows)
    .fill(null)
    .map(() => Array(columns).fill(null))

  // Fill the grid with plots
  plots.forEach((plot) => {
    const plotNumber = Number.parseInt(plot.number)
    const row = Math.floor((plotNumber - 1) / columns)
    const col = (plotNumber - 1) % columns

    if (row >= 0 && row < rows && col >= 0 && col < columns) {
      grid[row][col] = plot
    }
  })

  const handlePlotClick = (plot: Plot) => {
    if (plot.status === "available") {
      setSelectedPlot(plot)
      if (onPlotSelect) {
        onPlotSelect(plot)
      }
    }
  }

  const handleBookVisit = () => {
    if (selectedPlot) {
      router.push(`/visit/book?project=${projectId}&plot=${selectedPlot.id}`)
    }
  }

  const getStatusColor = (status: PlotStatus) => {
    switch (status) {
      case "available":
        return "bg-green-100 border-green-300 hover:bg-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400"
      case "booked":
        return "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400"
      case "sold":
        return "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400"
      case "reserved":
        return "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400"
      case "unavailable":
        return "bg-gray-100 border-gray-300 text-gray-500 dark:bg-gray-800/30 dark:border-gray-700 dark:text-gray-400"
      default:
        return "bg-gray-100 border-gray-300 text-gray-500 dark:bg-gray-800/30 dark:border-gray-700 dark:text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-green-100 border border-green-300 dark:bg-green-900/30 dark:border-green-800"></div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-amber-100 border border-amber-300 dark:bg-amber-900/30 dark:border-amber-800"></div>
          <span className="text-sm">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-red-100 border border-red-300 dark:bg-red-900/30 dark:border-red-800"></div>
          <span className="text-sm">Sold</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-blue-100 border border-blue-300 dark:bg-blue-900/30 dark:border-blue-800"></div>
          <span className="text-sm">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-gray-100 border border-gray-300 dark:bg-gray-800/30 dark:border-gray-700"></div>
          <span className="text-sm">Unavailable</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="border rounded-md p-4">
                <div
                  className="grid"
                  style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: "0.5rem" }}
                >
                  {grid.map((row, rowIndex) =>
                    row.map((plot, colIndex) => (
                      <TooltipProvider key={`${rowIndex}-${colIndex}`}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`aspect-square flex items-center justify-center border rounded-md cursor-pointer text-sm font-medium ${plot ? getStatusColor(plot.status) : "bg-gray-50 border-gray-200 dark:bg-gray-800/10 dark:border-gray-800"}`}
                              onClick={() => plot && handlePlotClick(plot)}
                            >
                              {plot ? plot.number : ""}
                            </div>
                          </TooltipTrigger>
                          {plot && (
                            <TooltipContent>
                              <div className="text-sm">
                                <p className="font-medium">Plot {plot.number}</p>
                                <p>Status: {plot.status.charAt(0).toUpperCase() + plot.status.slice(1)}</p>
                                {plot.size && <p>Size: {plot.size}</p>}
                                {plot.price && <p>Price: ${plot.price.toLocaleString()}</p>}
                              </div>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    )),
                  )}
                </div>
              </div>

              {selectedPlot && selectedPlot.status === "available" && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
                  <h3 className="font-medium text-green-800 dark:text-green-400 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Plot {selectedPlot.number} Selected
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                    This plot is available for booking. Would you like to schedule a visit?
                  </p>
                  <div className="mt-3">
                    <Button onClick={handleBookVisit}>Book a Visit</Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

