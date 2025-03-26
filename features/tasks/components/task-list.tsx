'use client';

import {
  CalendarIcon,
  Clock,
  Edit,
  Filter,
  Loader2,
  MoreHorizontal,
  Search,
  Trash,
  CheckCircle2,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { useTasks } from '../hooks/use-tasks';
import type { Task, TaskFilters } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TaskListProps {
  title?: string;
  emptyMessage?: string;
  showFilters?: boolean;
  initialFilters?: TaskFilters;
}

export function TaskList({
  title = 'Tasks',
  emptyMessage = 'No tasks found',
  showFilters = true,
  initialFilters,
}: TaskListProps) {
  const { tasks, loading, error, fetchTasks, updateTask, deleteTask } = useTasks();
  const [filters, setFilters] = useState<TaskFilters>(initialFilters || {});
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  // Apply filters and search
  useEffect(() => {
    if (loading) return;

    let results = [...tasks];

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      results = results.filter((task) => filters.status?.includes(task.status));
    }

    // Apply priority filter
    if (filters.priority && filters.priority.length > 0) {
      results = results.filter((task) => filters.priority?.includes(task.priority));
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (task) =>
          task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)
      );
    }

    setFilteredTasks(results);
  }, [tasks, filters, searchQuery, loading]);

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks(filters);
  }, [fetchTasks, filters]);

  const handleStatusChange = async (taskId: string, _newStatus: Task['status']) => {
    try {
      await updateTask(taskId, { status: newStatus });
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const _handleTaskDelete = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  // Function to format date
  const _formatDate = (date: Date | null | undefined) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString();
  };

  // Get status badge color
  const _getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get priority badge
  const _getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-4 text-muted-foreground">Error loading tasks: {error}</p>
            <Button onClick={() => fetchTasks()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{filteredTasks.length} tasks found</CardDescription>
          </div>

          {showFilters && (
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tasks..."
                  className="pl-8 w-full md:w-[200px]"
                  value={searchQuery}
                  onChange={(_e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select
                value={filters.status?.join(',') || ''}
                onValueChange={(value) => {
                  setFilters({
                    ...filters,
                    status: value ? (value.split(',') as Task['status'][]) : undefined,
                  });
                }}
              >
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.priority?.join(',') || ''}
                onValueChange={(value) => {
                  setFilters({
                    ...filters,
                    priority: value ? (value.split(',') as Task['priority'][]) : undefined,
                  });
                }}
              >
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={() => setFilters({})}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="mb-4 text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Priority</TableHead>
                  <TableHead className="hidden lg:table-cell">Due Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <Checkbox
                        checked={task.status === 'completed'}
                        onCheckedChange={(checked) => {
                          handleStatusChange(task.id, checked ? 'completed' : 'pending');
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {task.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getStatusBadge(task.status)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {getPriorityBadge(task.priority)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {task.assignedTo ? (
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={task.assignedTo.avatar} alt={task.assignedTo.name} />
                            <AvatarFallback>{task.assignedTo.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span>{task.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            handleStatusChange(
                              task.id,
                              task.status === 'completed' ? 'pending' : 'completed'
                            );
                          }}
                        >
                          <CheckCircle2
                            className={`h-4 w-4 ${
                              task.status === 'completed'
                                ? 'text-green-500'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTaskDelete(task.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
