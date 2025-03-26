import { BaseEntity } from '@/types/common';

/**
 * Task status types
 */
export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'on_hold'
  | 'blocked';

/**
 * Task priority levels
 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Task history entry types
 */
export type TaskHistoryAction =
  | 'created'
  | 'status_updated'
  | 'comment_added'
  | 'assigned'
  | 'priority_updated'
  | 'due_date_updated';

/**
 * Task history entry
 */
export interface TaskHistoryEntry {
  action: TaskHistoryAction;
  timestamp: Date;
  userId: string;
  previousStatus?: string;
  newStatus?: string;
  comment?: string;
}

/**
 * Task model
 */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  projectId: string | null;
  assignedTo: string | null;
  dueDate: Date | null;
  priority: TaskPriority;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  category: string | null;
  completedAt: Date | null;
  history: TaskHistoryEntry[];
}

/**
 * Payload for creating a task
 */
export interface CreateTaskPayload {
  title: string;
  description?: string;
  projectId?: string;
  assignedTo?: string;
  dueDate?: Date;
  priority?: TaskPriority;
  status?: string;
  category?: string;
}

/**
 * Payload for updating a task
 */
export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  projectId?: string;
  assignedTo?: string;
  dueDate?: Date;
  priority?: TaskPriority;
  status?: string;
  category?: string;
  comment?: string;
}

/**
 * Payload for updating task status
 */
export interface TaskStatusUpdatePayload {
  taskId: string;
  status: string;
  comment?: string;
}

/**
 * Payload for adding a comment to a task
 */
export interface TaskCommentPayload {
  taskId: string;
  comment: string;
}

/**
 * Task statistics model
 */
export interface TaskStatistics {
  total: number;
  byStatus: Record<string, number>;
  byProject: Record<string, number>;
  byAssignee: Record<string, number>;
}
