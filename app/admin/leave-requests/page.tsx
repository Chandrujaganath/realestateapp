'use client';

import {
  Calendar,
  Search,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Download,
  CalendarRange,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';

import { DatePickerWithRange } from '@/components/date-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';

type LeaveRequestStatus = 'pending' | 'approved' | 'rejected';
type LeaveRequestType = 'vacation' | 'medical' | 'sick' | 'personal';

interface LeaveRequest {
  id: string;
  managerId: string;
  managerName: string;
  requestDate: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveRequestStatus;
  type: LeaveRequestType;
  details?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export default function LeaveRequestsPage() {
  const { getAllLeaveRequests, approveLeaveRequest, rejectLeaveRequest } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaveRequestStatus | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  useEffect(() => {
    const _fetchRequests = async () => {
      try {
        if (getAllLeaveRequests) {
          const _data = await getAllLeaveRequests();
          // Type assertion to ensure data matches our LeaveRequest interface
          const typedData = _data as unknown as LeaveRequest[];
          setLeaveRequests(typedData || []);
          setFilteredRequests(typedData.filter((req) => req.status === statusFilter) || []);
        }
      } catch (error) {
        console.error('Failed to fetch leave requests:', error);
      } finally {
        setLoading(false);
      }
    };

    _fetchRequests();
  }, [getAllLeaveRequests]);

  useEffect(() => {
    let filtered = leaveRequests;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    // Filter by date range
    if (dateRange.from && dateRange.to) {
      filtered = filtered.filter((request) => {
        const requestDate = new Date(request.requestDate);
        return requestDate >= dateRange.from! && requestDate <= dateRange.to!;
      });
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          (request.managerName && request.managerName.toLowerCase().includes(query)) ||
          (request.reason && request.reason.toLowerCase().includes(query))
      );
    }

    setFilteredRequests(filtered);
  }, [searchQuery, statusFilter, dateRange, leaveRequests]);

  const _handleApproveRequest = async (id: string) => {
    setProcessingAction(true);
    try {
      if (approveLeaveRequest) {
        await approveLeaveRequest(id);

        // Update local state
        setLeaveRequests((prev) =>
          prev.map((req) => (req.id === id ? { ...req, status: 'approved' } : req))
        );
      }
    } catch (error) {
      console.error('Failed to approve leave request:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  const _handleRejectRequest = async () => {
    if (!selectedRequestId) return;

    setProcessingAction(true);
    try {
      if (rejectLeaveRequest) {
        await rejectLeaveRequest(selectedRequestId, rejectionReason);

        // Update local state
        setLeaveRequests((prev) =>
          prev.map((req) =>
            req.id === selectedRequestId ? { ...req, status: 'rejected', rejectionReason } : req
          )
        );

        // Reset state
        setSelectedRequestId(null);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Failed to reject leave request:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  if (loading) {
    return <LeaveRequestsSkeleton />;
  }

  // Mock data for demonstration
  const _mockRequests =
    filteredRequests.length > 0
      ? filteredRequests
      : [
          {
            id: '1',
            managerId: '1',
            managerName: 'John Smith',
            requestDate: '2023-06-01',
            startDate: '2023-06-15',
            endDate: '2023-06-18',
            reason: 'Family vacation',
            status: 'pending' as const,
            type: 'vacation' as const,
            details: 'Annual family trip',
          },
          {
            id: '2',
            managerId: '2',
            managerName: 'Emily Johnson',
            requestDate: '2023-06-02',
            startDate: '2023-06-10',
            endDate: '2023-06-11',
            reason: 'Personal appointment',
            status: 'pending' as const,
            type: 'personal' as const,
            details: "Doctor's appointment",
          },
          {
            id: '3',
            managerId: '4',
            managerName: 'Sarah Wilson',
            requestDate: '2023-05-20',
            startDate: '2023-06-05',
            endDate: '2023-06-09',
            reason: 'Medical leave',
            status: 'approved' as const,
            type: 'medical' as const,
            details: 'Surgery recovery',
            approvedAt: '2023-05-21',
          },
          {
            id: '4',
            managerId: '1',
            managerName: 'John Smith',
            requestDate: '2023-05-15',
            startDate: '2023-05-30',
            endDate: '2023-05-30',
            reason: 'Sick day',
            status: 'rejected' as const,
            type: 'sick' as const,
            details: 'Not feeling well',
            rejectionReason: 'Short staffed on this day, please reschedule',
            rejectedAt: '2023-05-16',
          },
        ];

  const _getStatusBadge = (status: LeaveRequestStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const _getLeaveTypeBadge = (type: LeaveRequestType) => {
    switch (type) {
      case 'vacation':
        return <Badge variant="secondary">Vacation</Badge>;
      case 'medical':
        return <Badge variant="destructive">Medical</Badge>;
      case 'sick':
        return <Badge variant="outline">Sick</Badge>;
      case 'personal':
        return <Badge variant="default">Personal</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const _handleStatusChange = (value: string) => {
    setStatusFilter(value as LeaveRequestStatus | 'all');
  };

  const _handleDateChange = (date: DateRange | undefined) => {
    if (date) {
      setDateRange(date);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leave Requests</h1>
        <p className="text-muted-foreground">Manage manager leave requests</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveRequests.filter((req) => req.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveRequests.filter((req) => req.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveRequests.filter((req) => req.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>Manage leave requests from project managers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
            <div className="grid w-full md:w-64">
              <Select value={statusFilter} onValueChange={_handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full md:w-72">
              <DatePickerWithRange date={dateRange} setDate={_handleDateChange} />
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="ml-auto">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Manager</TableHead>
                  <TableHead>Leave Period</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {_mockRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="font-medium">{request.managerName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <CalendarRange className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{request.startDate}</span>
                          {request.startDate !== request.endDate && (
                            <span> to {request.endDate}</span>
                          )}
                        </div>
                        <div className="mt-1">{_getLeaveTypeBadge(request.type)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="truncate" title={request.reason}>
                          {request.reason}
                        </p>
                        {request.details && (
                          <p
                            className="text-xs text-muted-foreground truncate"
                            title={request.details}
                          >
                            {request.details}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{_getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      {request.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => _handleApproveRequest(request.id)}
                            disabled={processingAction}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Approve
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setSelectedRequestId(request.id)}
                                disabled={processingAction}
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Leave Request</DialogTitle>
                                <DialogDescription>
                                  Please provide a reason for rejecting this leave request. This
                                  will be communicated to the manager.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                                  <Textarea
                                    id="rejection-reason"
                                    placeholder="Enter reason for rejection"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRequestId(null);
                                    setRejectionReason('');
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={_handleRejectRequest}
                                  disabled={!rejectionReason || processingAction}
                                >
                                  Confirm Rejection
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                      {request.status !== 'pending' && (
                        <Button variant="outline" size="sm">
                          <Calendar className="mr-1 h-3 w-3" />
                          View Details
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LeaveRequestsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
            <Skeleton className="h-10 w-full md:w-64" />
            <Skeleton className="h-10 w-full md:w-72" />
            <Skeleton className="h-10 w-full md:w-64" />
            <Skeleton className="h-10 w-24 ml-auto" />
          </div>

          <div className="rounded-md border">
            <div className="p-4">
              <div className="flex gap-4 border-b pb-4 mb-4">
                <Skeleton className="h-4 w-full max-w-[120px]" />
                <Skeleton className="h-4 w-full max-w-[150px]" />
                <Skeleton className="h-4 w-full max-w-[180px]" />
                <Skeleton className="h-4 w-full max-w-[80px]" />
                <Skeleton className="h-4 w-full max-w-[80px]" />
              </div>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex gap-4 py-3">
                    <Skeleton className="h-8 w-full max-w-[120px]" />
                    <Skeleton className="h-10 w-full max-w-[150px]" />
                    <Skeleton className="h-8 w-full max-w-[180px]" />
                    <Skeleton className="h-6 w-full max-w-[80px]" />
                    <Skeleton className="h-8 w-full max-w-[80px]" />
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
