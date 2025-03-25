"use client";

import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  CellType, 
  CellStatus, 
  RoadDirection, 
  GridCell, 
  UpdateCellRequest,
  DragData,
  GridData,
  PlotStatus
} from "@/features/projects/types/grid";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Square,
  Map as RoadIcon,
  PencilRuler,
  GripHorizontal,
  GripVertical,
  Plus,
  Activity, 
  Save,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Home,
  Info,
  MapPin,
  Trash,
  Edit,
  CheckCircle,
  Minus
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Add utility function for UUID generation
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface ProjectGridEditorProps {
  projectId: string;
  initialGrid: GridData;
  onSave: (gridData: GridData) => void;
}

export function ProjectGridEditor({ projectId, initialGrid, onSave }: ProjectGridEditorProps) {
  const { toast } = useToast();
  
  const [rows, setRows] = useState(initialGrid.rows || 10);
  const [cols, setCols] = useState(initialGrid.cols || 10);
  const [cells, setCells] = useState<GridCell[]>(initialGrid.cells || []);
  const [currentTool, setCurrentTool] = useState<"plot" | "road" | "empty" | "select">("select");
  const [selectedCell, setSelectedCell] = useState<GridCell | null>(null);
  const [editingCell, setEditingCell] = useState<GridCell | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // Initialize grid on first load or when dimensions change
  useEffect(() => {
    if (initialGrid.cells?.length === 0 || !initialGrid.cells) {
      initializeGrid(rows, cols);
    } else if (rows !== initialGrid.rows || cols !== initialGrid.cols) {
      // Handle grid resize
      resizeGrid(rows, cols);
    }
  }, [rows, cols]);
  
  // Mark that changes need to be saved
  useEffect(() => {
    if (cells.length > 0 && JSON.stringify(cells) !== JSON.stringify(initialGrid.cells)) {
      setUnsavedChanges(true);
    }
  }, [cells]);

  const initializeGrid = (rows: number, cols: number) => {
    const newCells: GridCell[] = [];
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        newCells.push({
          id: uuidv4(),
          row: r,
          col: c,
          type: "empty"
        });
      }
    }
    
    setCells(newCells);
  };
  
  const resizeGrid = (newRows: number, newCols: number) => {
    // Keep existing cells that fit within new dimensions
    const existingCells = cells.filter(cell => cell.row < newRows && cell.col < newCols);
    
    // Add new cells for expanded areas
    const newCells: GridCell[] = [...existingCells];
    
    for (let r = 0; r < newRows; r++) {
      for (let c = 0; c < newCols; c++) {
        // Check if this cell already exists
        const exists = existingCells.some(cell => cell.row === r && cell.col === c);
        
        if (!exists) {
          newCells.push({
            id: uuidv4(),
            row: r,
            col: c,
            type: "empty"
          });
        }
      }
    }
    
    setCells(newCells);
  };
  
  const handleCellClick = (cell: GridCell) => {
    if (currentTool === "select") {
      setSelectedCell(cell);
      return;
    }
    
    // Apply the selected tool
    const updatedCells = cells.map(c => {
      if (c.id === cell.id) {
        const updatedCell = { ...c, type: currentTool as CellType };
        
        // Add default values for plots
        if (currentTool === "plot" && c.type !== "plot") {
          updatedCell.plotNumber = `P-${c.row+1}-${c.col+1}`;
          updatedCell.status = "available" as PlotStatus;
        }
        
        // Remove plot properties if changing from plot to something else
        if (currentTool !== "plot" && c.type === "plot") {
          delete updatedCell.plotNumber;
          delete updatedCell.status;
          delete updatedCell.price;
          delete updatedCell.size;
          delete updatedCell.notes;
        }
        
        return updatedCell;
      }
      return c;
    });
    
    setCells(updatedCells);
    setUnsavedChanges(true);
  };
  
  const openCellEditor = (cell: GridCell) => {
    setEditingCell({ ...cell });
    setIsEditorOpen(true);
  };
  
  const saveCellEdits = () => {
    if (!editingCell) return;
    
    const updatedCells = cells.map(cell => 
      cell.id === editingCell.id ? { ...editingCell } : cell
    );
    
    setCells(updatedCells);
    setIsEditorOpen(false);
    setEditingCell(null);
    setUnsavedChanges(true);
  };
  
  const handleSaveGrid = () => {
    const gridData: GridData = {
      rows,
      cols,
      cells
    };
    
    onSave(gridData);
    setUnsavedChanges(false);
  };
  
  const getCellClass = (cell: GridCell) => {
    let className = "w-12 h-12 border flex items-center justify-center cursor-pointer text-xs relative";
    
    // Base style by type
    switch (cell.type) {
      case "plot":
        className += " bg-blue-100 hover:bg-blue-200";
        if (cell.status === "available") className += " border-blue-500 border-2";
        if (cell.status === "reserved") className += " border-yellow-500 border-2 bg-yellow-100";
        if (cell.status === "sold") className += " border-green-500 border-2 bg-green-100";
        if (cell.status === "pending") className += " border-orange-500 border-2 bg-orange-100";
        break;
      case "road":
        className += " bg-gray-400 hover:bg-gray-500";
        break;
      default:
        className += " bg-white hover:bg-gray-100";
    }
    
    // Selected state
    if (selectedCell?.id === cell.id) {
      className += " ring-2 ring-offset-2 ring-primary";
    }
    
    return className;
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Grid Layout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rows">Rows</Label>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => rows > 1 && setRows(rows - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input 
                    id="rows" 
                    type="number" 
                    value={rows} 
                    onChange={(e) => setRows(Math.max(1, parseInt(e.target.value) || 1))}
                    className="mx-2 w-20 text-center"
                    min="1"
                    max="50"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => rows < 50 && setRows(rows + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cols">Columns</Label>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => cols > 1 && setCols(cols - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input 
                    id="cols" 
                    type="number" 
                    value={cols} 
                    onChange={(e) => setCols(Math.max(1, parseInt(e.target.value) || 1))}
                    className="mx-2 w-20 text-center"
                    min="1"
                    max="50"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => cols < 50 && setCols(cols + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <Label>Tools</Label>
              <div className="flex space-x-2 mt-2">
                <Button 
                  variant={currentTool === "select" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setCurrentTool("select")}
                >
                  <Info className="h-4 w-4 mr-2" />
                  Select
                </Button>
                <Button 
                  variant={currentTool === "plot" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setCurrentTool("plot")}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Plot
                </Button>
                <Button 
                  variant={currentTool === "road" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setCurrentTool("road")}
                >
                  <RoadIcon className="h-4 w-4 mr-2" />
                  Road
                </Button>
                <Button 
                  variant={currentTool === "empty" ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setCurrentTool("empty")}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
          
          <div className="border rounded-md p-4 overflow-auto">
            <ScrollArea className="h-[500px]">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-center">
                  <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                    {cells.map((cell) => (
                      <div 
                        key={cell.id}
                        className={getCellClass(cell)}
                        onClick={() => handleCellClick(cell)}
                        onDoubleClick={() => cell.type === "plot" && openCellEditor(cell)}
                      >
                        {cell.type === "plot" && (
                          <>
                            <span className="text-xs font-medium">{cell.plotNumber}</span>
                            {cell.type === "plot" && cell.status === "sold" && (
                              <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-green-500"></div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {selectedCell && selectedCell.type === "plot" && (
            <Card className="p-4 mt-4">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-sm font-medium">Plot Details</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Plot Number</Label>
                    <div className="text-sm font-medium">{selectedCell.plotNumber}</div>
                  </div>
                  <div>
                    <Label className="text-xs">Status</Label>
                    <div className="text-sm font-medium capitalize">{selectedCell.status}</div>
                  </div>
                  {selectedCell.price && (
                    <div>
                      <Label className="text-xs">Price</Label>
                      <div className="text-sm font-medium">₹{selectedCell.price.toLocaleString()}</div>
                    </div>
                  )}
                  {selectedCell.size && (
                    <div>
                      <Label className="text-xs">Size</Label>
                      <div className="text-sm font-medium">{selectedCell.size}</div>
                    </div>
                  )}
                </div>
                {selectedCell.notes && (
                  <div>
                    <Label className="text-xs">Notes</Label>
                    <div className="text-sm">{selectedCell.notes}</div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-0 pt-2">
                <Button size="sm" variant="outline" onClick={() => openCellEditor(selectedCell)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Edit Plot
                </Button>
              </CardFooter>
            </Card>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {cells.filter(c => c.type === "plot").length} plots, 
            {cells.filter(c => c.type === "road").length} road cells
          </div>
          <Button onClick={handleSaveGrid} disabled={!unsavedChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Layout
          </Button>
        </CardFooter>
      </Card>
      
      {/* Plot Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Plot Details</DialogTitle>
            <DialogDescription>
              Update the details for this plot.
            </DialogDescription>
          </DialogHeader>
          
          {editingCell && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plotNumber">Plot Number</Label>
                  <Input
                    id="plotNumber"
                    value={editingCell.plotNumber || ""}
                    onChange={(e) => setEditingCell({ ...editingCell, plotNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editingCell.status || "available"}
                    onValueChange={(value) => setEditingCell({ ...editingCell, status: value as PlotStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={editingCell.price || ""}
                    onChange={(e) => setEditingCell({ ...editingCell, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Size (e.g., "30x40")</Label>
                  <Input
                    id="size"
                    value={editingCell.size || ""}
                    onChange={(e) => setEditingCell({ ...editingCell, size: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={editingCell.notes || ""}
                  onChange={(e) => setEditingCell({ ...editingCell, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
            <Button onClick={saveCellEdits}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 