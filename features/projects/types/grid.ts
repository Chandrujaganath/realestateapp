/**
 * Type of cell in the project grid
 */
export type CellType = 'plot' | 'road' | 'empty';

/**
 * Direction of a road
 */
export type RoadDirection = 'horizontal' | 'vertical' | 'intersection';

/**
 * Status of a cell
 */
export type CellStatus = 'available' | 'reserved' | 'sold' | 'pending';

/**
 * Status of a plot
 */
export type PlotStatus =
  | 'available'
  | 'reserved'
  | 'sold'
  | 'pending'
  | 'booked'
  | 'unavailable'
  | 'under_development'
  | 'completed';

/**
 * Cell in a project grid
 */
export interface GridCell {
  id: string;
  row: number;
  col: number;
  type: CellType;
  name?: string;
  price?: number;
  size?: string;
  metadata?: Record<string, any>;

  // Road specific properties
  roadDirection?: RoadDirection;

  // Plot specific properties
  plotId?: string;
  plotNumber?: string;
  status?: PlotStatus;
  notes?: string;
}

/**
 * Grid layout for a project
 */
export interface ProjectGrid {
  id: string;
  projectId: string;
  rows: number;
  cols: number;
  cells: GridCell[];
  name?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Request to update a cell in the grid
 */
export interface UpdateCellRequest {
  id: string;
  type?: CellType;
  roadDirection?: RoadDirection;
  plotNumber?: string;
  status?: PlotStatus;
  price?: number;
  size?: string;
  notes?: string;
}

/**
 * Data structure for drag operations on the grid
 */
export interface DragData {
  sourceId: string;
  targetId: string;
}

export interface GridData {
  rows: number;
  cols: number;
  cells: GridCell[];
}
