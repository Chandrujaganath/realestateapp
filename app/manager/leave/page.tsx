"use client"

import { useState, useEffect } from "react"
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import type { LeaveRequest } from "@/contexts/auth-context"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isAfter, isBefore, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function LeavePage() {
  const { getManagerLeaveRequests, submitLeaveRequest } = useAuth()

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const requests = await getManagerLeaveRequests()
        setLeaveRequests(requests)
      } catch (error) {
        console.error("Error fetching leave requests:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaveRequests()
  }, [getManagerLeaveRequests])

  const handleSubmitLeave = async () => {
    if (!startDate || !endDate || !reason) return

    setIsSubmitting(true)

    try {
      await submitLeaveRequest(startDate, endDate, reason)

      // Add the new request to the list
      const newRequest: LeaveRequest = {
        id: `leave-${Date.now()}`,
        managerId: "current-user",
        managerName: "Current User",
        startDate,
        endDate,
        reason,
        status: "pending",
        createdAt: new Date(),
      }

      setLeaveRequests([newRequest, ...leaveRequests])

      // Reset form
      setStartDate(undefined)
      setEndDate(undefined)
      setReason("")

      // Show success message
      setSubmitSuccess(true)

      // Close dialog after a delay
      setTimeout(() => {
        setShowLeaveDialog(false)
        setSubmitSuccess(false)
      }, 2000)
    } catch (error) {
      console.error("Error submitting leave request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getLeaveStatusBadge = (status: LeaveRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )
      case "approved":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-3 w-3" />
            Approved
          </span>
        )
      case "rejected":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="h-3 w-3" />
            Rejected
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link
            href="/dashboard/manager"
            className="flex items-center text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Leave Management</h1>
          <p className="text-muted-foreground">Request and track your leave applications</p>
        </div>

        <Button onClick={() => setShowLeaveDialog(true)}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          Request Leave
        </Button>
      </div>

      {/* Leave Requests List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Your Leave Requests</h2>

        {leaveRequests.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-6">You haven't submitted any leave requests yet</p>
              <Button onClick={() => setShowLeaveDialog(true)}>Request Your First Leave</Button>
            </CardContent>
          </Card>
        ) : (
          leaveRequests.map((request) => (
            <Card key={request.id} className="glass-card">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        request.status === "pending"
                          ? "bg-amber-100 dark:bg-amber-900/30"
                          : request.status === "approved"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-red-100 dark:bg-red-900/30"
                      }`}
                    >
                      <CalendarIcon
                        className={`h-5 w-5 ${
                          request.status === "pending"
                            ? "text-amber-600 dark:text-amber-400"
                            : request.status === "approved"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2 mb-1">{getLeaveStatusBadge(request.status)}</div>
                      <h3 className="text-lg font-medium">Leave Request</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(request.startDate, "PPP")} to {format(request.endDate, "PPP")}
                      </p>
                      <p className="text-sm mt-1">{request.reason}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>Requested: {request.createdAt.toLocaleDateString()}</span>
                        {request.status === "approved" && request.approvedAt && (
                          <>
                            <span>•</span>
                            <span>Approved: {request.approvedAt.toLocaleDateString()}</span>
                          </>
                        )}
                        {request.status === "rejected" && request.rejectedAt && (
                          <>
                            <span>•</span>
                            <span>Rejected: {request.rejectedAt.toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {request.status === "pending" && (
                    <Button variant="outline" className="glass-button">
                      Cancel Request
                    </Button>
                  )}
                </div>

                {request.status === "rejected" && request.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">Rejection Reason:</h4>
                    <p className="text-sm text-red-700 dark:text-red-300">{request.rejectionReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Leave Policy */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Leave Policy</CardTitle>
          <CardDescription>Important information about leave requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Annual Leave Entitlement</h3>
            <p className="text-sm text-muted-foreground">
              Each manager is entitled to 20 days of annual leave per calendar year.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Request Process</h3>
            <p className="text-sm text-muted-foreground">
              Leave requests should be submitted at least 7 days in advance for proper planning. Emergency leave may be
              granted at the discretion of the administration.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Approval Process</h3>
            <p className="text-sm text-muted-foreground">
              Leave requests are reviewed by the admin team. You will be notified once your request is approved or
              rejected.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Task Allocation During Leave</h3>
            <p className="text-sm text-muted-foreground">
              During your approved leave, tasks will be automatically assigned to other available managers. Upon your
              return, you will be prioritized for new task assignments.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Request Leave Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
            <DialogDescription>Submit a leave request for approval by the admin team.</DialogDescription>
          </DialogHeader>

          {submitSuccess ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Request Submitted!</h3>
              <p className="text-center text-muted-foreground">
                Your leave request has been submitted successfully. You will be notified once it's reviewed.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal glass-button",
                            !startDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          disabled={
                            (date) =>
                              isBefore(date, addDays(new Date(), 6)) || // Require 7 days notice
                              (endDate ? isAfter(date, endDate) : false) // Start date can't be after end date
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal glass-button",
                            !endDate && "text-muted-foreground",
                          )}
                          disabled={!startDate}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          disabled={
                            (date) =>
                              !startDate || // Disable if no start date
                              isBefore(date, startDate) // End date can't be before start date
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Reason for Leave</label>
                  <Textarea
                    placeholder="Please provide a reason for your leave request..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={5}
                    className="resize-none"
                  />
                </div>

                {startDate && endDate && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400">Leave Duration:</h4>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowLeaveDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitLeave} disabled={isSubmitting || !startDate || !endDate || !reason}>
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


