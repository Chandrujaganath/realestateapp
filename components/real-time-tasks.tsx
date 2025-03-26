'use client';

import { formatDistanceToNow } from 'date-fns';
import { collection, onSnapshot, query, where, orderBy, Firestore } from 'firebase/firestore';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdAt: any;
  dueDate: any;
  assignedTo: string;
  type: string;
  referenceId?: string;
}

export function RealTimeTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (!user?.uid) return;

    // Make sure Firestore is initialized
    if (!db) {
      console.error('Firestore not initialized');
      setLoading(false);
      return;
    }

    // Set up real-time listener for tasks
    const _tasksQuery = query(
      collection(db as Firestore, 'tasks'),
      where('assignedTo', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const _unsubscribe = onSnapshot(
      tasksQuery,
      (_snapshot) => {
        const _newTasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];

        setTasks(newTasks);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const _response = await fetch('/api/tasks/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'pending') return task.status === 'pending';
    if (activeTab === 'in-progress') return task.status === 'in-progress';
    if (activeTab === 'completed') return task.status === 'completed';
    return true;
  });

  const _getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return null;
    }
  };

  const _getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const _isDueDate = (dueDate: any) => {
    if (!dueDate) return false;
    const _now = new Date();
    const _due = dueDate.toDate();
    return due < now;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Loading your tasks...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((_i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>Manage your assigned tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="pending">
              Pending
              {tasks.filter((t) => t.status === 'pending').length > 0 && (
                <Badge variant="outline" className="ml-2">
                  {tasks.filter((t) => t.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No {activeTab} tasks</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <div key={task.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <h4 className="text-sm font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {getPriorityBadge(task.priority)}
                            {task.dueDate && (
                              <span
                                className={`text-xs ${isDueDate(task.dueDate) ? 'text-red-500' : 'text-muted-foreground'}`}
                              >
                                Due{' '}
                                {formatDistanceToNow(task.dueDate.toDate(), {
                                  addSuffix: true,
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {task.status === 'pending' && (
                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTaskStatus(task.id, 'in-progress')}
                        >
                          Start Task
                        </Button>
                      </div>
                    )}

                    {task.status === 'in-progress' && (
                      <div className="mt-4 flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                        >
                          Complete
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
