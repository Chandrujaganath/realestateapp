'use client';

import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PauseCircle,
  AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTasks } from '@/features/tasks/hooks/use-tasks';
import { Task, TaskStatus } from '@/features/tasks/types/task';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  showActions?: boolean;
}

export function TaskCard({ task, showActions = true }: TaskCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { updateTask, deleteTask } = useTasks();
  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Get status icon based on task status
  const _getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'on_hold':
        return <PauseCircle className="h-4 w-4" />;
      case 'blocked':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Get status color based on task status
  const _getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'on_hold':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'blocked':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Get priority color based on task priority
  const _getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'urgent':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Handle task status update
  const _handleStatusUpdate = async (_newStatus: string) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      updateTaskStatus({
        taskId: task.id,
        status: newStatus,
        comment: comment || undefined,
      });

      // Reset comment state
      setComment('');
      setShowCommentInput(false);
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle task deletion
  const _handleDeleteTask = async () => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      await deleteTask(task.id);
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if status change is allowed
  const _canChangeStatus = () => {
    if (!user) return false;

    // User-specific permission logic could be added here
    return true;
  };

  // Handle click on the task card
  const handleCardClick = () => {
    router.push(`/tasks/${task.id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1 cursor-pointer" onClick={handleCardClick}>
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <CardDescription>
              {task.category && (
                <Badge variant="outline" className="mr-2">
                  {task.category}
                </Badge>
              )}
              Created {task.createdAt ? format(task.createdAt, 'MMM d, yyyy') : ''}
            </CardDescription>
          </div>

          {showActions && canChangeStatus() && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/tasks/${task.id}`)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/tasks/${task.id}/edit`)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                <DropdownMenuItem
                  disabled={task.status === 'pending'}
                  onClick={() => setShowCommentInput(true)}
                >
                  Set to Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={task.status === 'in_progress'}
                  onClick={() => setShowCommentInput(true)}
                >
                  Set to In Progress
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={task.status === 'completed'}
                  onClick={() => setShowCommentInput(true)}
                >
                  Mark as Completed
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={task.status === 'on_hold'}
                  onClick={() => setShowCommentInput(true)}
                >
                  Place On Hold
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                      Delete Task
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Task</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this task? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteTask}
                        disabled={isSubmitting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 cursor-pointer" onClick={handleCardClick}>
        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          <Badge
            variant="outline"
            className={cn('flex items-center gap-1', getStatusColor(task.status))}
          >
            {getStatusIcon(task.status)}
            {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
          </Badge>

          <Badge variant="outline" className={cn(getPriorityColor(task.priority))}>
            Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>

          {task.dueDate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={cn(
                      'flex items-center gap-1',
                      new Date(task.dueDate) < new Date() && task.status !== 'completed'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    )}
                  >
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  {new Date(task.dueDate) < new Date() && task.status !== 'completed'
                    ? 'Overdue'
                    : 'Due date'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>

      {showCommentInput && (
        <CardFooter className="flex flex-col p-4 pt-0 gap-2">
          <Textarea
            placeholder="Add a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            className="resize-none"
          />
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCommentInput(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() =>
                handleStatusUpdate(task.status === 'completed' ? 'in_progress' : 'completed')
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

function updateTaskStatus(_arg0: { taskId: string; status: string; comment: string | undefined }) {
  throw new Error('Function not implemented.');
}
