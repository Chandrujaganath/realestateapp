'use client';

import {
  Calendar,
  Building2,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Task } from '@/contexts/auth-context';
import { useAuth } from '@/hooks/use-auth';

export default function TasksPage() {
  const { getManagerTasks } = useAuth();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    const _fetchTasks = async () => {
      try {
        const fetchedTasks = await getManagerTasks();
        setTasks(fetchedTasks);

        // Apply initial status filter from URL if present
        if (statusFilter) {
          setFilteredTasks(fetchedTasks.filter((task) => task.status === statusFilter));
        } else {
          setFilteredTasks(fetchedTasks);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [getManagerTasks, statusFilter]);

  useEffect(() => {
    // Apply filters whenever they change
    let result = tasks;

    // Status filter
    if (statusFilter) {
      result = result.filter((task) => task.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((task) => task.type === typeFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.description.toLowerCase().includes(query) ||
          task.projectName.toLowerCase().includes(query) ||
          task.requestorName.toLowerCase().includes(query) ||
          (task.plotNumber && task.plotNumber.toLowerCase().includes(query))
      );
    }

    setFilteredTasks(result);
  }, [tasks, statusFilter, typeFilter, priorityFilter, searchQuery]);

  const _getTaskTypeIcon = (type: Task['type']) => {
    switch (type) {
      case 'visit_request':
        return <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'sell_request':
        return <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'client_query':
        return <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'guest_assistance':
        return <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const _getTaskStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <AlertCircle className="h-3 w-3" />
            Pending
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Clock className="h-3 w-3" />
            In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const _getTaskPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return (
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Low
          </span>
        );
      case 'medium':
        return (
          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            Medium
          </span>
        );
      case 'high':
        return (
          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            High
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/manager"
          className="flex items-center text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Task Management</h1>
        <p className="text-muted-foreground">View and manage your assigned tasks</p>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(_e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select
                value={statusFilter || 'all'}
                onValueChange={(value) => {
                  // Update URL with status filter
                  const url = new URL(window.location.href);
                  if (value === 'all') {
                    url.searchParams.delete('status');
                  } else {
                    url.searchParams.set('status', value);
                  }
                  window.history.pushState({}, '', url);

                  // Apply filter
                  if (value === 'all') {
                    setFilteredTasks(tasks);
                  } else {
                    setFilteredTasks(tasks.filter((task) => task.status === value));
                  }
                }}
              >
                <SelectTrigger className="glass-button">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="glass-button">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="visit_request">Visit Request</SelectItem>
                  <SelectItem value="sell_request">Sell Request</SelectItem>
                  <SelectItem value="client_query">Client Query</SelectItem>
                  <SelectItem value="guest_assistance">Guest Assistance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="glass-button">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-6">No tasks found matching your filters</p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('all');
                  setPriorityFilter('all');
                  window.history.pushState({}, '', window.location.pathname);
                  setFilteredTasks(tasks);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="glass-card">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        task.type === 'visit_request'
                          ? 'bg-blue-100 dark:bg-blue-900/30'
                          : task.type === 'sell_request'
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : task.type === 'client_query'
                              ? 'bg-purple-100 dark:bg-purple-900/30'
                              : 'bg-amber-100 dark:bg-amber-900/30'
                      }`}
                    >
                      {getTaskTypeIcon(task.type)}
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2 mb-1">
                        {getTaskStatusBadge(task.status)}
                        {getTaskPriorityBadge(task.priority)}
                      </div>
                      <h3 className="text-lg font-medium">
                        {task.type === 'visit_request'
                          ? 'Visit Request'
                          : task.type === 'sell_request'
                            ? 'Sell Request'
                            : task.type === 'client_query'
                              ? 'Client Query'
                              : 'Guest Assistance'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {task.projectName} {task.plotNumber ? `- Plot ${task.plotNumber}` : ''}
                      </p>
                      <p className="text-sm mt-1">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>From: {task.requestorName}</span>
                        <span>•</span>
                        <span>Created: {task.createdAt.toLocaleDateString()}</span>
                        {task.dueDate && (
                          <>
                            <span>•</span>
                            <span>Due: {task.dueDate.toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 self-end md:self-center">
                    <Link href={`/manager/tasks/${task.id}`}>
                      <Button variant="outline" className="glass-button">
                        View Details
                      </Button>
                    </Link>

                    {task.status === 'pending' && (
                      <Link href={`/manager/tasks/${task.id}?action=start`}>
                        <Button>Start Task</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
