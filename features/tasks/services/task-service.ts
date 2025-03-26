import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  _limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  Timestamp,
  Firestore,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

import {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskStatusUpdatePayload,
  TaskCommentPayload,
  TaskStatistics,
} from '@/features/tasks/types/task';
import { db } from '@/lib/firebase';
import { ApiService } from '@/services/api-service';
import { FirebaseService } from '@/services/firebase-service';

/**
 * Service for handling task-related operations
 */
export class TaskService extends FirebaseService {
  private apiService: ApiService;
  private readonly collectionName = 'tasks';

  constructor() {
    super();
    this.apiService = new ApiService();
  }

  /**
   * Get all tasks
   */
  async getAllTasks(): Promise<Task[]> {
    try {
      if (!db) {
        console.error('Firestore not initialized');
        return [];
      }

      const tasksRef = collection(db as Firestore, this.collectionName);
      const q = query(tasksRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => this.mapDocToTask(doc));
    } catch (error) {
      console.error('Error getting all tasks:', error);
      throw new Error('Failed to get tasks');
    }
  }

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<Task> {
    try {
      if (!db) {
        console.error('Firestore not initialized');
        throw new Error('Firestore not initialized');
      }

      const taskDoc = await getDoc(doc(db as Firestore, this.collectionName, id));

      if (!taskDoc.exists()) {
        throw new Error('Task not found');
      }

      return this.mapDocToTask(taskDoc);
    } catch (error) {
      console.error(`Error getting task with id ${id}:`, error);
      throw new Error('Failed to get task');
    }
  }

  /**
   * Create a new task
   */
  async createTask(payload: CreateTaskPayload, userId: string): Promise<string> {
    try {
      if (!db) {
        console.error('Firestore not initialized');
        throw new Error('Firestore not initialized');
      }

      const _taskData = {
        ...payload,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: payload.status || 'pending',
        history: [
          {
            action: 'created',
            timestamp: Timestamp.now(),
            userId,
            newStatus: payload.status || 'pending',
          },
        ],
      };

      const _docRef = await addDoc(collection(db as Firestore, this.collectionName), taskData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  /**
   * Update a task
   */
  async updateTask(id: string, payload: UpdateTaskPayload, userId: string): Promise<void> {
    try {
      if (!db) {
        console.error('Firestore not initialized');
        throw new Error('Firestore not initialized');
      }

      const taskRef = doc(db as Firestore, this.collectionName, id);
      const taskDoc = await getDoc(taskRef);

      if (!taskDoc.exists()) {
        throw new Error('Task not found');
      }

      const currentTask = taskDoc.data() as any;
      const _statusChanged = payload.status && payload.status !== currentTask.status;

      // Prepare history entry if status has changed
      const historyEntry = statusChanged
        ? {
            action: 'status_updated',
            timestamp: Timestamp.now(),
            userId,
            previousStatus: currentTask.status,
            newStatus: payload.status,
            comment: payload.comment || null,
          }
        : null;

      // Update the task
      await updateDoc(taskRef, {
        ...payload,
        updatedAt: serverTimestamp(),
        ...(historyEntry ? { history: arrayUnion(historyEntry) } : {}),
      });
    } catch (error) {
      console.error(`Error updating task with id ${id}:`, error);
      throw new Error('Failed to update task');
    }
  }

  /**
   * Update task status with optional comment
   */
  async updateTaskStatus(payload: TaskStatusUpdatePayload, userId: string): Promise<void> {
    try {
      // Use the API service to call our specialized endpoint
      await this.apiService.post('/api/tasks/update-status', {
        ...payload,
        userId,
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      throw new Error('Failed to update task status');
    }
  }

  /**
   * Add comment to task
   */
  async addTaskComment(payload: TaskCommentPayload, userId: string): Promise<void> {
    try {
      if (!db) {
        console.error('Firestore not initialized');
        throw new Error('Firestore not initialized');
      }

      const { taskId, comment } = payload;
      const taskRef = doc(db as Firestore, this.collectionName, taskId);
      const taskDoc = await getDoc(taskRef);

      if (!taskDoc.exists()) {
        throw new Error('Task not found');
      }

      const historyEntry = {
        action: 'comment_added',
        timestamp: Timestamp.now(),
        userId,
        comment,
      };

      await updateDoc(taskRef, {
        updatedAt: serverTimestamp(),
        history: arrayUnion(historyEntry),
      });
    } catch (error) {
      console.error(`Error adding comment to task with id ${payload.taskId}:`, error);
      throw new Error('Failed to add comment');
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    try {
      if (!db) {
        console.error('Firestore not initialized');
        throw new Error('Firestore not initialized');
      }

      await deleteDoc(doc(db as Firestore, this.collectionName, id));
    } catch (error) {
      console.error(`Error deleting task with id ${id}:`, error);
      throw new Error('Failed to delete task');
    }
  }

  /**
   * Get tasks by assignee
   */
  async getTasksByAssignee(userId: string): Promise<Task[]> {
    try {
      if (!db) {
        console.error('Firestore not initialized');
        return [];
      }

      const tasksRef = collection(db as Firestore, this.collectionName);
      const q = query(tasksRef, where('assignedTo', '==', userId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => this.mapDocToTask(doc));
    } catch (error) {
      console.error(`Error getting tasks for assignee ${userId}:`, error);
      throw new Error('Failed to get tasks by assignee');
    }
  }

  /**
   * Get tasks by project
   */
  async getTasksByProject(projectId: string): Promise<Task[]> {
    try {
      if (!db) {
        console.error('Firestore not initialized');
        return [];
      }

      const tasksRef = collection(db as Firestore, this.collectionName);
      const q = query(tasksRef, where('projectId', '==', projectId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => this.mapDocToTask(doc));
    } catch (error) {
      console.error(`Error getting tasks for project ${projectId}:`, error);
      throw new Error('Failed to get tasks by project');
    }
  }

  /**
   * Get tasks by status
   */
  async getTasksByStatus(status: string): Promise<Task[]> {
    try {
      if (!db) {
        console.error('Firestore not initialized');
        return [];
      }

      const tasksRef = collection(db as Firestore, this.collectionName);
      const q = query(tasksRef, where('status', '==', status), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => this.mapDocToTask(doc));
    } catch (error) {
      console.error(`Error getting tasks with status ${status}:`, error);
      throw new Error('Failed to get tasks by status');
    }
  }

  /**
   * Get task statistics
   */
  async getTaskStatistics(): Promise<TaskStatistics> {
    try {
      // Default statistics structure
      const stats: TaskStatistics = {
        total: 0,
        byStatus: {},
        byProject: {},
        byAssignee: {},
      };

      // Get all tasks
      const tasks = await this.getAllTasks();
      stats.total = tasks.length;

      // Calculate statistics
      tasks.forEach((task) => {
        // Count by status
        if (!stats.byStatus[task.status]) {
          stats.byStatus[task.status] = 0;
        }
        stats.byStatus[task.status]++;

        // Count by project
        if (task.projectId && !stats.byProject[task.projectId]) {
          stats.byProject[task.projectId] = 0;
        }
        if (task.projectId) {
          stats.byProject[task.projectId]++;
        }

        // Count by assignee
        if (task.assignedTo && !stats.byAssignee[task.assignedTo]) {
          stats.byAssignee[task.assignedTo] = 0;
        }
        if (task.assignedTo) {
          stats.byAssignee[task.assignedTo]++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting task statistics:', error);
      throw new Error('Failed to get task statistics');
    }
  }

  /**
   * Helper to map Firestore doc to Task
   */
  private mapDocToTask(doc: QueryDocumentSnapshot<DocumentData> | any): Task {
    const data = doc.data();

    return {
      id: doc.id,
      title: data.title,
      description: data.description || null,
      status: data.status,
      projectId: data.projectId || null,
      assignedTo: data.assignedTo || null,
      dueDate: data.dueDate ? data.dueDate.toDate() : null,
      priority: data.priority || 'medium',
      createdBy: data.createdBy,
      createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
      category: data.category || null,
      completedAt: data.completedAt ? data.completedAt.toDate() : null,
      history: data.history
        ? data.history.map((item: any) => ({
            ...item,
            timestamp: item.timestamp ? item.timestamp.toDate() : new Date(),
          }))
        : [],
    };
  }
}
