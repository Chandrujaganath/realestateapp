"use client"

import { useState, useEffect } from "react"
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search, DollarSign, User, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Mock sell request type
interface SellRequest {
  id: string
  clientId: string
  clientName: string
  plotId: string
  plotNumber: string
  projectId: string
  projectName: string
  reason: string
  status: "open" | "under_review" | "negotiation" | "finalized" | "cancelled"
  createdAt: Date
  updatedAt?: Date
  managerNotes?: string
}

export default function SellRequestsPage() {
  const { user } = useAuth()

  const [sellRequests, setSellRequests] = useState<SellRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<SellRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<SellRequest | null>(null)
  const [showUpdateDialog, setShowUpdateDialog] = useState(false)
  const [newStatus, setNewStatus] = useState<SellRequest["status"]>("open")
  const [managerNotes, setManagerNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchSellRequests = async () => {
      try {
        // In a real implementation, fetch sell requests from Firestore
        // For now, we'll use mock data
        const mockRequests: SellRequest[] = [
          {
            id: "sell-1",
            clientId: "client-1",
            clientName: "John Doe",
            plotId: "plot-101",
            plotNumber: "101",
            projectId: "project-1",
            projectName: "Sunrise Gardens",
            reason: "Relocating to another city for work",
            status: "open",
            createdAt: new Date(2025, 2, 15), // March 15, 2025
          },
          {
            id: "sell-2",
            clientId: "client-2",
            clientName: "Jane Smith",
            plotId: "plot-205",
            plotNumber: "205",
            projectId: "project-2",
            projectName: "Metropolitan Heights",
            reason: "Upgrading to a larger property",
            status: "under_review",
            createdAt: new Date(2025, 2, 10), // March 10, 2025
            updatedAt: new Date(2025, 2, 12), // March 12, 2025
            managerNotes: "Reviewing property details and market value",
          },
          {
            id: "sell-3",
            clientId: "client-3",
            clientName: "Robert Johnson",
            plotId: "plot-310",
            plotNumber: "310",
            projectId: "project-1",
            projectName: "Sunrise Gardens",
            reason: "Financial reasons",
            status: "negotiation",
            createdAt: new Date(2025, 2, 5), // March 5, 2025
            updatedAt: new Date(2025, 2, 8), // March 8, 2025
            managerNotes: "Discussing pricing with potential buyers",
          },
          {
            id: "sell-4",
            clientId: "client-4",
            clientName: "Emily Davis",
            plotId: "plot-412",
            plotNumber: "412",
            projectId: "project-3",
            projectName: "Riverside Villas",
            reason: "Moving abroad",
            status: "finalized",
            createdAt: new Date(2025, 1, 20), // February 20, 2025
            updatedAt: new Date(2025, 2, 1), // March 1, 2025
            managerNotes: "Sale finalized with buyer. Paperwork in process.",
          },
        ]

        setSellRequests(mockRequests)
        setFilteredRequests(mockRequests)
      } catch (error) {
        console.error("Error fetching sell requests:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSellRequests()
  }, [])

  useEffect(() => {
    // Apply filters whenever they change
    let result = sellRequests

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((request) => request.status === statusFilter)
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (request) =>
          request.clientName.toLowerCase().includes(query) ||
          request.projectName.toLowerCase().includes(query) ||
          request.plotNumber.toLowerCase().includes(query) ||
          request.reason.toLowerCase().includes(query),
      )
    }

    setFilteredRequests(result)
  }, [sellRequests, statusFilter, searchQuery])

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) return

    setIsSubmitting(true)

    try {
      // In a real implementation, update the sell request status in Firestore
      // For now, we'll just update the local state
      const updatedRequests = sellRequests.map((request) => {
        if (request.id === selectedRequest.id) {
          return {
            ...request,
            status: newStatus,
            updatedAt: new Date(),
            managerNotes: managerNotes || request.managerNotes,
          }
        }
        return request
      })

      setSellRequests(updatedRequests)

      // Close dialog
      setShowUpdateDialog(false)

      // Reset form
      setSelectedRequest(null)
      setNewStatus("open")
      setManagerNotes("")
    } catch (error) {
      console.error("Error updating sell request status:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: SellRequest["status"]) => {
    switch (status) {
      case "open":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <AlertCircle className="h-3 w-3" />
            Open
          </span>
        )
      case "under_review":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="h-3 w-3" />
            Under Review
          </span>
        )
      case "negotiation":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
            <DollarSign className="h-3 w-3" />
            Negotiation
          </span>
        )
      case "finalized":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-3 w-3" />
            Finalized
          </span>
        )
      case "cancelled":
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="h-3 w-3" />
            Cancelled
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
      <div>
        <Link href="/dashboard/manager" className="flex items-center text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Sell Requests</h1>
        <p className="text-muted-foreground">Manage client requests to sell their properties</p>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by client, project, or plot..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="glass-button">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="finalized">Finalized</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sell Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-6">No sell requests found matching your filters</p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                  setFilteredRequests(sellRequests)
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="glass-card">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="flex flex-wrap gap-2 mb-1">{getStatusBadge(request.status)}</div>
                      <h3 className="text-lg font-medium">Sell Request - Plot {request.plotNumber}</h3>
                      <p className="text-sm text-muted-foreground">{request.projectName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm">{request.clientName}</p>
                      </div>
                      <p className="text-sm mt-2">{request.reason}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>Requested: {request.createdAt.toLocaleDateString()}</span>
                        {request.updatedAt && (
                          <>
                            <span>•</span>
                            <span>Updated: {request.updatedAt.toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 self-end md:self-center">
                    <Button
                      variant="outline"
                      className="glass-button"
                      onClick={() => {
                        setSelectedRequest(request)
                        setNewStatus(request.status)
                        setManagerNotes(request.managerNotes || "")
                        setShowUpdateDialog(true)
                      }}
                    >
                      Update Status
                    </Button>

                    <Link href={`/plot/${request.plotId}`}>
                      <Button>View Property</Button>
                    </Link>
                  </div>
                </div>

                {request.managerNotes && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-md">
                    <h4 className="text-sm font-medium mb-1">Manager Notes:</h4>
                    <p className="text-sm text-muted-foreground">{request.managerNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Update Status Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Sell Request Status</DialogTitle>
            <DialogDescription>Update the status and add notes for this sell request.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {selectedRequest && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Request Details</h3>
                <div className="bg-muted/50 p-3 rounded-md space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Client:</span> {selectedRequest.clientName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Property:</span> {selectedRequest.projectName} - Plot{" "}
                    {selectedRequest.plotNumber}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Reason:</span> {selectedRequest.reason}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                <SelectTrigger className="glass-button">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="finalized">Finalized</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Manager Notes</label>
              <Textarea
                placeholder="Add notes about the current status, next steps, or any other relevant information..."
                value={managerNotes}
                onChange={(e) => setManagerNotes(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

