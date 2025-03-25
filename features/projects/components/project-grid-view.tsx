"use client"

import { useState, useEffect, useRef, useMemo, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CellType, 
  GridCell, 
  GridData 
} from "@/features/projects/types/grid"
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Home, Plus, Minus, X, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface ProjectGridViewProps {
  projectId: string
  gridData: GridData
  onPlotSelect?: (plotCell: GridCell) => void
}

// Memoized plot component for better performance
const PlotCell = memo(({ 
  plot, 
  getPlotColorClass, 
  getStatusBadge, 
  onClick 
}: { 
  plot: GridCell, 
  getPlotColorClass: (status?: string) => string,
  getStatusBadge: (status?: string) => JSX.Element,
  onClick: (plot: GridCell) => void
}) => {
  return (
    <HoverCard key={plot.id} openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <motion.div
          className={`absolute flex items-center justify-center w-12 h-12 border-2 cursor-pointer rounded-sm ${getPlotColorClass(plot.status)}`}
          style={{
            left: `${plot.col * 50}px`,
            top: `${plot.row * 50}px`,
            zIndex: 10
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onClick(plot)}
          transition={{ duration: 0.2 }}
        >
          <span className="text-xs font-medium">{plot.plotNumber}</span>
        </motion.div>
      </HoverCardTrigger>
      <HoverCardContent className="w-60 z-50">
        <div className="flex justify-between">
          <h4 className="font-semibold">{plot.plotNumber}</h4>
          {getStatusBadge(plot.status)}
        </div>
        <div className="mt-2 space-y-1">
          {plot.size && (
            <div className="text-sm">
              <span className="font-medium text-muted-foreground">Size:</span> {plot.size}
            </div>
          )}
          {plot.price && (
            <div className="text-sm">
              <span className="font-medium text-muted-foreground">Price:</span> ₹{plot.price.toLocaleString()}
            </div>
          )}
          {plot.notes && (
            <div className="text-sm mt-1">
              <span className="font-medium text-muted-foreground">Notes:</span> {plot.notes}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
});

PlotCell.displayName = "PlotCell";

// Memoized road component
const RoadCell = memo(({ road }: { road: GridCell }) => {
  return (
    <div
      key={road.id}
      className="absolute w-12 h-12 bg-gray-300"
      style={{
        left: `${road.col * 50}px`,
        top: `${road.row * 50}px`,
      }}
    />
  );
});

RoadCell.displayName = "RoadCell";

// Main component
export function ProjectGridView({ projectId, gridData, onPlotSelect }: ProjectGridViewProps) {
  const [selectedPlot, setSelectedPlot] = useState<GridCell | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showPlotDetail, setShowPlotDetail] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Extract plots and roads from grid data - memoized to prevent unnecessary recalculations
  const { plots, roads, emptyCells } = useMemo(() => {
    return {
      plots: gridData.cells.filter(cell => cell.type === "plot"),
      roads: gridData.cells.filter(cell => cell.type === "road"),
      emptyCells: gridData.cells.filter(cell => cell.type === "empty")
    };
  }, [gridData.cells]);

  useEffect(() => {
    // Simulate loading for smoother transitions
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [])

  // Handle zooming
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleZoomReset = () => {
    setZoomLevel(1)
  }

  // Handle plot selection
  const handlePlotClick = (plot: GridCell) => {
    setSelectedPlot(plot)
    setShowPlotDetail(true)
    if (onPlotSelect) {
      onPlotSelect(plot)
    }
  }

  // Get color for a plot based on status
  const getPlotColorClass = (status?: string) => {
    switch (status) {
      case "available":
        return "bg-blue-100 border-blue-500 hover:bg-blue-200"
      case "reserved":
        return "bg-yellow-100 border-yellow-500 hover:bg-yellow-200"
      case "sold":
        return "bg-green-100 border-green-500 hover:bg-green-200"
      case "pending":
        return "bg-orange-100 border-orange-500 hover:bg-orange-200"
      default:
        return "bg-blue-100 border-blue-500 hover:bg-blue-200"
    }
  }

  // Get status badge color
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-blue-500">Available</Badge>
      case "reserved":
        return <Badge className="bg-yellow-500">Reserved</Badge>
      case "sold":
        return <Badge className="bg-green-500">Sold</Badge>
      case "pending":
        return <Badge className="bg-orange-500">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card className="mb-16">
        <CardContent className="flex justify-center items-center py-10">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-16">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Project Layout</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom out">
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomReset} title="Reset zoom">
              <Home className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom in">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] rounded-md border">
          <div 
            ref={containerRef} 
            className="relative w-full h-full p-4 overflow-hidden"
          >
            <motion.div
              className="relative"
              style={{ 
                transformOrigin: "center",
                width: `${gridData.cols * 50}px`,
                height: `${gridData.rows * 50}px`
              }}
              animate={{ 
                scale: zoomLevel,
              }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 30 
              }}
            >
              {/* Background grid */}
              <div 
                className="absolute inset-0 grid"
                style={{ gridTemplateColumns: `repeat(${gridData.cols}, 1fr)` }}
              >
                {emptyCells.map(cell => (
                  <div 
                    key={cell.id}
                    className="w-12 h-12 border border-gray-100"
                    style={{
                      gridColumn: cell.col + 1,
                      gridRow: cell.row + 1,
                    }}
                  />
                ))}
              </div>

              {/* Roads - non-interactive */}
              {roads.map(road => (
                <RoadCell key={road.id} road={road} />
              ))}

              {/* Plots with hover interaction */}
              {plots.map(plot => (
                <PlotCell 
                  key={plot.id} 
                  plot={plot} 
                  getPlotColorClass={getPlotColorClass}
                  getStatusBadge={getStatusBadge}
                  onClick={handlePlotClick}
                />
              ))}
            </motion.div>
          </div>
        </ScrollArea>

        <div className="mt-4 text-sm text-muted-foreground flex gap-2 items-center flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 border border-blue-500 rounded-sm"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-100 border border-yellow-500 rounded-sm"></div>
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-100 border border-green-500 rounded-sm"></div>
            <span>Sold</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-100 border border-orange-500 rounded-sm"></div>
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-300 rounded-sm"></div>
            <span>Road</span>
          </div>
        </div>
      </CardContent>

      {/* Plot Detail Dialog */}
      <Dialog open={showPlotDetail} onOpenChange={setShowPlotDetail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Plot Details: {selectedPlot?.plotNumber}</span>
              {selectedPlot && getStatusBadge(selectedPlot.status)}
            </DialogTitle>
            <DialogDescription>
              Detailed information about this plot
            </DialogDescription>
          </DialogHeader>

          {selectedPlot && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Plot Number</h4>
                  <p>{selectedPlot.plotNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <p className="capitalize">{selectedPlot.status}</p>
                </div>
                {selectedPlot.size && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Size</h4>
                    <p>{selectedPlot.size}</p>
                  </div>
                )}
                {selectedPlot.price && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Price</h4>
                    <p>₹{selectedPlot.price.toLocaleString()}</p>
                  </div>
                )}
              </div>
              
              {selectedPlot.notes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                  <p className="text-sm">{selectedPlot.notes}</p>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button variant="default" className="mt-2" onClick={() => setShowPlotDetail(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
} 