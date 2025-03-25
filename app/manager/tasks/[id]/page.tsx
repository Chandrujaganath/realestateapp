"use client"

import { useState, useEffect } from "react"
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Building2,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  MapIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { Task } from "@/context/auth-context"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const { getManagerTasks, updateTaskStatus } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const action = searchParams.get("action")

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const tasks = await getManagerTasks()
        const foundTask = tasks.find((t) => t.id === params.id)

        if (foundTask) {
          setTask(foundTask)

          // If action=start is in the URL, automatically start the task
          if (action === "start" && foundTask.status === "pending") {
            handleStartTask()
          }
        }
      } catch (error) {
        console.error("Error fetching task:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [getManagerTasks, params.id, action])

  const handleStartTask = async () => {
    if (!task) return

    setIsSubmitting(true)

    try {
      await updateTaskStatus(task.id, "in_progress")

      // Update local state
      setTask({
        ...task,
        status: "in_progress",
      })

      // Remove action from URL
      router.replace(`/manager/tasks/${task.id}`)
    } catch (error) {
      console.error("Error starting task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCompleteTask = async () => {
    if (!task) return

    setIsSubmitting(true)

    try {
      await updateTaskStatus(task.id, "completed", feedback)

      // Update local state
      setTask({
        ...task,
        status: "completed",
        completedAt: new Date(),
        managerFeedback: feedback,
      })

      // Close dialog
      setShowCompleteDialog(false)

      // Clear feedback
      setFeedback("")
    } catch (error) {
      console.error("Error completing task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRejectTask = async () => {
    if (!task) return

    setIsSubmitting(true)

    try {
      await updateTaskStatus(task.id, "rejected", feedback)

      // Update local state
      setTask({
        ...task,
        status: "rejected",
        managerFeedback: feedback,
      })

      // Close dialog
      setShowRejectDialog(false)

      // Clear feedback
      setFeedback("")
    } catch (error) {
      console.error("Error rejecting task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTaskTypeIcon = (type: Task["type"]) => {
    switch (type) {
      case "visit_request":
        return <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      case "sell_request":
        return <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
      case "client_query":
        return <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      case "guest_assistance":
        return <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getTaskStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <AlertCircle className="h-4 w-4" />
            Pending
          </span>
        )
      case "in_progress":
        return (
          <span className="flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Clock className="h-4 w-4" />
            In Progress
          </span>
        )
      case "completed":
        return (
          <span className="flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            Completed
          </span>
        )
      case "rejected":
        return (
          <span className="flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            Rejected
          </span>
        )
      default:
        return null
    }
  }

  const getTaskPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "low":
        return (
          <span className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            Low Priority
          </span>
        )
      case "medium":
        return (
          <span className="text-sm px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            Medium Priority
          </span>
        )
      case "high":
        return (
          <span className="text-sm px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            High Priority
          </span>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="space-y-8">
        <div>
          <Link href="/manager/tasks" className="flex items-center text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Tasks
          </Link>
          <h1 className="text-3xl font-bold mb-2">Task Not Found</h1>
          <p className="text-muted-foreground">The requested task could not be found.</p>
        </div>

        <div className="flex justify-center">
          <Link href="/manager/tasks">
            <Button>View All Tasks</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/manager/tasks" className="flex items-center text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Tasks
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {task.type === "visit_request"
                ? "Visit Request"
                : task.type === "sell_request"
                  ? "Sell Request"
                  : task.type === "client_query"
                    ? "Client Query"
                    : "Guest Assistance"}
            </h1>
            <div className="flex flex-wrap gap-2">
              {getTaskStatusBadge(task.status)}
              {getTaskPriorityBadge(task.priority)}
            </div>
          </div>

          <div className="flex gap-2">
            {task.status === "pending" && (
              <Button onClick={handleStartTask} disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                    Starting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Clock className="mr-2 h-4 w-4" />
                    Start Task
                  </span>
                )}
              </Button>
            )}

            {task.status === "in_progress" && (
              <>
                <Button variant="outline" className="glass-button" onClick={() => setShowRejectDialog(true)}>
                  Reject Task
                </Button>

                <Button onClick={() => setShowCompleteDialog(true)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Task
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Task Details */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p>{task.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Project</h3>
                  <p>{task.projectName}</p>
                </div>

                {task.plotNumber && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Plot</h3>
                    <p>Plot {task.plotNumber}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                  <p>{task.createdAt.toLocaleDateString()}</p>
                </div>

                {task.dueDate && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h3>
                    <p>{task.dueDate.toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {task.managerFeedback && (
                <div className="bg-muted/50 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-1">Your Feedback</h3>
                  <p className="text-sm">{task.managerFeedback}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons for Mobile */}
          <div className="md:hidden">
            {task.status === "pending" && (
              <Button className="w-full" onClick={handleStartTask} disabled={isSubmitting}>
                {isSubmitting ? "Starting..." : "Start Task"}
              </Button>
            )}

            {task.status === "in_progress" && (
              <div className="flex gap-2">
                <Button variant="outline" className="w-full glass-button" onClick={() => setShowRejectDialog(true)}>
                  Reject Task
                </Button>

                <Button className="w-full" onClick={() => setShowCompleteDialog(true)}>
                  Complete Task
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Requestor Information */}
        <div>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Requestor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{task.requestorName}</p>
                  <p className="text-sm text-muted-foreground capitalize">{task.requestorRole}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm">example@email.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm">City, Country</p>
                </div>
              </div>

              <Button variant="outline" className="w-full glass-button">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Requestor
              </Button>
            </CardContent>
          </Card>

          {/* Related Links */}
          <Card className="glass-card mt-6">
            <CardHeader>
              <CardTitle>Related Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/project/${task.projectId}`}>
                <Button variant="outline" className="w-full glass-button justify-start">
                  <Building2 className="mr-2 h-4 w-4" />
                  View Project
                </Button>
              </Link>

              {task.plotId && (
                <Link href={`/plot/${task.plotId}`}>
                  <Button variant="outline" className="w-full glass-button justify-start">
                    <MapIcon className="mr-2 h-4 w-4" />
                    View Plot
                  </Button>
                </Link>
              )}

              {task.type === "visit_request" && (
                <Link href="/manager/visit-requests">
                  <Button variant="outline" className="w-full glass-button justify-start">
                    <Calendar className="mr-2 h-4 w-4" />
                    All Visit Requests
                  </Button>
                </Link>
              )}

              {task.type === "sell_request" && (
                <Link href="/manager/sell-requests">
                  <Button variant="outline" className="w-full glass-button justify-start">
                    <Building2 className="mr-2 h-4 w-4" />
                    All Sell Requests
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Complete Task Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription>Add your feedback before marking this task as completed.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Feedback (Optional)</label>
              <Textarea
                placeholder="Add any notes or feedback about this task..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteTask} disabled={isSubmitting}>
              {isSubmitting ? "Completing..." : "Complete Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Task Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Task</DialogTitle>
            <DialogDescription>Please provide a reason for rejecting this task.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for Rejection</label>
              <Textarea
                placeholder="Explain why this task is being rejected..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
                className="resize-none"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectTask} disabled={isSubmitting || !feedback}>
              {isSubmitting ? "Rejecting..." : "Reject Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

