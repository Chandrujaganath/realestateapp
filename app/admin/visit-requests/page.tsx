'use client';

import {
  Calendar,
  Search,
  Clock,
  User,
  MapPin,
  Home,
  CheckCircle,
  XCircle,
  Download,
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

interface VisitRequest {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  projectName: string;
  propertyType: string;
  requestDate: string;
  preferredDate: string;
  preferredTime: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  rejectionReason?: string;
}

export default function VisitRequestsPage() {
  const { getVisitRequests, approveVisitRequest, rejectVisitRequest } = useAuth();
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<VisitRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    'pending'
  );
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
        if (getVisitRequests) {
          const data = await getVisitRequests();
          setVisitRequests(data || []);
          setFilteredRequests(data.filter((req) => req.status === statusFilter) || []);
        }
      } catch (error) {
        console.error('Failed to fetch visit requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [getVisitRequests]);

  useEffect(() => {
    let filtered = visitRequests;

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
          request.visitorName.toLowerCase().includes(query) ||
          request.projectName.toLowerCase().includes(query) ||
          request.propertyType.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  }, [searchQuery, statusFilter, dateRange, visitRequests]);

  const _handleApproveRequest = async (id: string) => {
    setProcessingAction(true);
    try {
      if (approveVisitRequest) {
        await approveVisitRequest(id);

        // Update local state
        setVisitRequests((prev) =>
          prev.map((req) => (req.id === id ? { ...req, status: 'approved' } : req))
        );
      }
    } catch (error) {
      console.error('Failed to approve visit request:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  const _handleRejectRequest = async () => {
    if (!selectedRequestId) return;

    setProcessingAction(true);
    try {
      if (rejectVisitRequest) {
        await rejectVisitRequest(selectedRequestId, rejectionReason);

        // Update local state
        setVisitRequests((prev) =>
          prev.map((req) =>
            req.id === selectedRequestId ? { ...req, status: 'rejected', rejectionReason } : req
          )
        );

        // Reset state
        setSelectedRequestId(null);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('Failed to reject visit request:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  if (loading) {
    return <VisitRequestsSkeleton />;
  }

  // Mock data for demonstration
  const _mockRequests =
    filteredRequests.length > 0
      ? filteredRequests
      : [
          {
            id: '1',
            visitorName: 'John Doe',
            visitorEmail: 'john.doe@example.com',
            visitorPhone: '+1 234 567 8901',
            projectName: 'Sunrise Gardens',
            propertyType: '2BHK Apartment',
            requestDate: '2023-06-01',
            preferredDate: '2023-06-15',
            preferredTime: '10:00 AM',
            status: 'pending',
            notes: 'Interested in lake view apartments',
          },
          {
            id: '2',
            visitorName: 'Jane Smith',
            visitorEmail: 'jane.smith@example.com',
            visitorPhone: '+1 345 678 9012',
            projectName: 'Metropolitan Heights',
            propertyType: '3BHK Apartment',
            requestDate: '2023-06-02',
            preferredDate: '2023-06-20',
            preferredTime: '2:00 PM',
            status: 'pending',
            notes: 'Looking for a corner unit with good ventilation',
          },
          {
            id: '3',
            visitorName: 'Robert Johnson',
            visitorEmail: 'robert.johnson@example.com',
            visitorPhone: '+1 456 789 0123',
            projectName: 'Urban Square',
            propertyType: 'Commercial Space',
            requestDate: '2023-05-28',
            preferredDate: '2023-06-10',
            preferredTime: '11:30 AM',
            status: 'approved',
            notes: 'Interested in retail space on ground floor',
          },
          {
            id: '4',
            visitorName: 'Emily Wilson',
            visitorEmail: 'emily.wilson@example.com',
            visitorPhone: '+1 567 890 1234',
            projectName: 'Lakeside Villas',
            propertyType: 'Villa',
            requestDate: '2023-05-25',
            preferredDate: '2023-06-05',
            preferredTime: '4:00 PM',
            status: 'rejected',
            rejectionReason: 'No availability on requested date',
            notes: 'Wants to see model villa first',
          },
        ];

  const _getStatusBadge = (status: VisitRequest['status']) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Visit Requests</h1>
        <p className="text-muted-foreground">Manage property visit requests</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {visitRequests.filter((req) => req.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {visitRequests.filter((req) => req.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {visitRequests.filter((req) => req.status === 'rejected').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visit Requests</CardTitle>
          <CardDescription>Manage property visit requests from clients and guests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
            <div className="grid w-full md:w-64">
              <Select
                value={statusFilter}
                onValueChange={(value: 'pending' | 'approved' | 'rejected' | 'all') =>
                  setStatusFilter(value)
                }
              >
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
              <DatePickerWithRange
                date={dateRange}
                setDate={(date) => {
                  if (date) {
                    setDateRange(date);
                  }
                }}
              />
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
                  <TableHead>Visitor</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {request.visitorName}
                        </div>
                        <div className="text-sm text-muted-foreground">{request.visitorEmail}</div>
                        <div className="text-sm text-muted-foreground">{request.visitorPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="font-medium flex items-center gap-1">
                          <Home className="h-3.5 w-3.5 text-muted-foreground" />
                          {request.projectName}
                        </div>
                        <div className="text-sm text-muted-foreground">{request.propertyType}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{request.preferredDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{request.preferredTime}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status as 'pending' | 'approved' | 'rejected')}
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApproveRequest(request.id)}
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
                                <DialogTitle>Reject Visit Request</DialogTitle>
                                <DialogDescription>
                                  Please provide a reason for rejecting this visit request. This
                                  will be communicated to the visitor.
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
                                  onClick={handleRejectRequest}
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

function VisitRequestsSkeleton() {
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
                <Skeleton className="h-4 w-full max-w-[150px]" />
                <Skeleton className="h-4 w-full max-w-[150px]" />
                <Skeleton className="h-4 w-full max-w-[120px]" />
                <Skeleton className="h-4 w-full max-w-[80px]" />
                <Skeleton className="h-4 w-full max-w-[80px]" />
              </div>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex gap-4 py-3">
                    <Skeleton className="h-12 w-full max-w-[150px]" />
                    <Skeleton className="h-12 w-full max-w-[150px]" />
                    <Skeleton className="h-12 w-full max-w-[120px]" />
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
