'use client';

import {
  _collection,
  _doc,
  _getDocs,
  _getDoc,
  _addDoc,
  _updateDoc,
  _deleteDoc,
  _query,
  _where,
  _orderBy,
  Timestamp,
  _serverTimestamp,
} from 'firebase/firestore';
import { useState, useEffect, useCallback } from 'react';

import type { Task, TaskStatistics, TaskFilters, CreateTaskInput } from '../types';
import { useAuth } from '@/contexts/auth-context';
import { _db } from '@/lib/firebase';

/**
 * Hook for accessing task data and operations
 */
export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock implementation - replace with actual Firebase implementation
  const fetchTasks = useCallback(async (_filters?: TaskFilters) => {
    setLoading(true);
    try {
      // Mock data for now - would normally query Firestore
      const mockTasks: Task[] = Array(5)
        .fill(null)
        .map((_, i) => ({
          id: `task-${i + 1}`,
          title: `Task ${i + 1}`,
          description: `This is a description for task ${i + 1}`,
          status: ['pending', 'in_progress', 'completed'][i % 3] as Task['status'],
          priority: ['low', 'medium', 'high'][i % 3] as Task['priority'],
          dueDate: new Date(Date.now() + (i + 1) * 86400000),
          assignedTo: {
            id: 'user1',
            name: 'John Doe',
          },
          project: {
            id: 'project1',
            name: 'Real Estate App',
          },
          createdBy: {
            id: 'admin1',
            name: 'Admin User',
          },
          createdAt: new Date(Date.now() - (i + 1) * 86400000),
          updatedAt: new Date(Date.now() - (i + 1) * 43200000),
        }));

      setTasks(mockTasks);
      return mockTasks;
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTaskStatistics = useCallback(async () => {
    setLoading(true);
    try {
      // Mock statistics - would normally calculate from Firestore data
      const mockStatistics: TaskStatistics = {
        total: 15,
        byStatus: {
          pending: 5,
          in_progress: 7,
          completed: 3,
        },
        byPriority: {
          low: 4,
          medium: 8,
          high: 3,
        },
        recentActivity: [],
      };

      setStatistics(mockStatistics);
      return mockStatistics;
    } catch (err) {
      console.error('Error fetching task statistics:', err);
      setError('Failed to fetch task statistics');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(
    async (taskData: CreateTaskInput) => {
      try {
        // Mock data creation - would normally add to Firestore
        const newTask: Task = {
          id: `task-${Date.now()}`,
          ...taskData,
          createdBy: {
            id: user?.uid || 'unknown',
            name: user?.displayName || 'Unknown User',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          dueDate: taskData.dueDate || null,
        };

        setTasks((prevTasks) => [...prevTasks, newTask]);

        // Refresh statistics after creating a task
        fetchTaskStatistics();

        return newTask;
      } catch (err) {
        console.error('Error creating task:', err);
        setError('Failed to create task');
        throw err;
      }
    },
    [user, fetchTaskStatistics]
  );

  const updateTask = useCallback(
    async (taskId: string, taskData: Partial<Task>) => {
      try {
        // Mock data update - would normally update in Firestore
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  ...taskData,
                  updatedAt: new Date(),
                  // If status is being updated to completed, set completedAt
                  ...(taskData.status === 'completed' ? { completedAt: new Date() } : {}),
                }
              : task
          )
        );

        // Refresh statistics after updating a task
        fetchTaskStatistics();

        return true;
      } catch (err) {
        console.error('Error updating task:', err);
        setError('Failed to update task');
        throw err;
      }
    },
    [fetchTaskStatistics]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      try {
        // Mock data deletion - would normally delete from Firestore
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

        // Refresh statistics after deleting a task
        fetchTaskStatistics();

        return true;
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Failed to delete task');
        throw err;
      }
    },
    [fetchTaskStatistics]
  );

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchTaskStatistics();
    }
  }, [user, fetchTasks, fetchTaskStatistics]);

  return {
    tasks,
    statistics,
    loading,
    error,
    fetchTasks,
    fetchTaskStatistics,
    createTask,
    updateTask,
    deleteTask,
  };
}
