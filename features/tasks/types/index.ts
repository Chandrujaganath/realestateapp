export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  project?: {
    id: string;
    name: string;
  };
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface TaskStatistics {
  total: number;
  byStatus: {
    pending: number;
    in_progress: number;
    completed: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
  recentActivity: Task[];
}

export interface TaskFilters {
  status?: Task['status'][];
  priority?: Task['priority'][];
  assignedTo?: string;
  project?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  searchQuery?: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  dueDate?: Date | null;
  assignedToId?: string;
  projectId?: string;
}
