'use client';

import {
  Users,
  Plus,
  Search,
  MapPin,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { PlusCircle, Mail, Phone, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useEffect, useState, ChangeEvent } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { UserData, LeaveRequest } from '@/hooks/use-auth';
import { useAuth } from '@/hooks/use-auth';

export default function ManagersPage() {
  const { getManagers, getAllLeaveRequests, approveLeaveRequest, rejectLeaveRequest } = useAuth();
  const [managers, setManagers] = useState<UserData[]>([]);
  const [filteredManagers, setFilteredManagers] = useState<UserData[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredLeaveRequests, setFilteredLeaveRequests] = useState<LeaveRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('managers');
  const [leaveRequestsTab, setLeaveRequestsTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    const _fetchData = async () => {
      try {
        const managersData = await getManagers();
        setManagers(managersData);
        setFilteredManagers(managersData);

        const leaveRequestsData = await getAllLeaveRequests();
        setLeaveRequests(leaveRequestsData);
        setFilteredLeaveRequests(
          leaveRequestsData.filter((request: LeaveRequest) => request.status === 'pending')
        );

        setLoading(false);
      } catch (error) {
        console.error('Error fetching managers data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [getManagers, getAllLeaveRequests]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredManagers(managers);
      setFilteredLeaveRequests(
        leaveRequests.filter((request) => request.status === leaveRequestsTab)
      );
    } else {
      const query = searchQuery.toLowerCase();

      // Filter managers
      const _filteredMgrs = managers.filter(
        (manager) =>
          (manager.displayName && manager.displayName.toLowerCase().includes(query)) ||
          (manager.email && manager.email.toLowerCase().includes(query)) ||
          (manager.city && manager.city.toLowerCase().includes(query))
      );
      setFilteredManagers(filteredMgrs);

      // Filter leave requests
      const _filteredRequests = leaveRequests.filter(
        (request) =>
          request.status === leaveRequestsTab &&
          (request.managerName.toLowerCase().includes(query) ||
            request.reason.toLowerCase().includes(query))
      );
      setFilteredLeaveRequests(filteredRequests);
    }
  }, [searchQuery, managers, leaveRequests, leaveRequestsTab]);

  const _handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchQuery('');
  };

  const _handleLeaveRequestsTabChange = (value: string) => {
    setLeaveRequestsTab(value);
    setFilteredLeaveRequests(leaveRequests.filter((request) => request.status === value));
  };

  const _handleApproveLeave = async (id: string) => {
    setProcessingAction(true);
    try {
      await approveLeaveRequest(id);

      // Update local state
      setLeaveRequests((prev) =>
        prev.map((request) =>
          request.id === id ? { ...request, status: 'approved', approvedAt: new Date() } : request
        )
      );

      // Update filtered requests
      setFilteredLeaveRequests((prev) => prev.filter((request) => request.id !== id));
    } catch (error) {
      console.error('Error approving leave request:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  const _handleRejectLeave = async () => {
    if (!selectedRequestId) return;

    setProcessingAction(true);
    try {
      await rejectLeaveRequest(selectedRequestId, rejectionReason);

      // Update local state
      setLeaveRequests((prev) =>
        prev.map((request) =>
          request.id === selectedRequestId
            ? {
                ...request,
                status: 'rejected',
                rejectedAt: new Date(),
                rejectionReason,
              }
            : request
        )
      );

      // Update filtered requests
      setFilteredLeaveRequests((prev) =>
        prev.filter((request) => request.id !== selectedRequestId)
      );

      // Reset state
      setSelectedRequestId(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting leave request:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  if (loading) {
    return <ManagersPageSkeleton />;
  }

  // Mock data for demonstration
  const _mockManagers =
    managers.length > 0
      ? managers
      : [
          {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '+1 234 567 8901',
            status: 'active',
            projects: ['Sunrise Gardens', 'Metropolitan Heights'],
            joinDate: '2023-01-15',
          },
          {
            id: '2',
            name: 'Emily Johnson',
            email: 'emily.johnson@example.com',
            phone: '+1 345 678 9012',
            status: 'active',
            projects: ['Urban Square'],
            joinDate: '2023-02-22',
          },
          {
            id: '3',
            name: 'Michael Brown',
            email: 'michael.brown@example.com',
            phone: '+1 456 789 0123',
            status: 'inactive',
            projects: [],
            joinDate: '2022-11-10',
          },
          {
            id: '4',
            name: 'Sarah Wilson',
            email: 'sarah.wilson@example.com',
            phone: '+1 567 890 1234',
            status: 'active',
            projects: ['Lakeside Villas', 'The Highlands'],
            joinDate: '2023-03-05',
          },
        ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Managers</h1>
          <p className="text-muted-foreground">Manage and monitor project managers</p>
        </div>
        <Link href="/admin/managers/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Manager
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8"
            value={searchQuery}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="managers" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="managers">
            Managers
            <Badge
              variant="outline"
              className="ml-2 bg-blue-500/10 text-blue-500 border-blue-500/20"
            >
              {managers.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="leave-requests">
            Leave Requests
            <Badge
              variant="outline"
              className="ml-2 bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
            >
              {leaveRequests.filter((r) => r.status === 'pending').length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="managers" className="mt-6">
          {filteredManagers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Users size={48} className="text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No managers found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {managers.length === 0
                    ? "You haven't added any managers yet."
                    : 'No managers match your search criteria.'}
                </p>
                <Link href="/admin/managers/create">
                  <Button>
                    <Plus size={16} className="mr-2" />
                    Add Manager
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredManagers.map((manager) => (
                <Link key={manager.uid} href={`/admin/managers/${manager.uid}`}>
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users size={16} className="text-primary" />
                            </div>
                            {manager.displayName}
                          </div>
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={
                            manager.isOnLeave
                              ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                              : 'bg-green-500/10 text-green-500 border-green-500/20'
                          }
                        >
                          {manager.isOnLeave ? 'On Leave' : 'Active'}
                        </Badge>
                      </div>
                      <CardDescription>{manager.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {manager.city && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin size={16} className="text-muted-foreground" />
                            <span>{manager.city}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 size={16} className="text-muted-foreground" />
                          <span>
                            {manager.assignedProjects && manager.assignedProjects.length > 0
                              ? `${manager.assignedProjects.length} projects assigned`
                              : 'No projects assigned'}
                          </span>
                        </div>
                        {manager.isOnLeave && manager.leaveEndDate && (
                          <div className="flex items-center gap-2 text-sm text-yellow-500">
                            <Calendar size={16} />
                            <span>
                              Returns on {new Date(manager.leaveEndDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leave-requests" className="mt-6">
          <Tabs
            defaultValue="pending"
            value={leaveRequestsTab}
            onValueChange={handleLeaveRequestsTabChange}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending
                <Badge
                  variant="outline"
                  className="ml-2 bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                >
                  {leaveRequests.filter((r) => r.status === 'pending').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved
                <Badge
                  variant="outline"
                  className="ml-2 bg-green-500/10 text-green-500 border-green-500/20"
                >
                  {leaveRequests.filter((r) => r.status === 'approved').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected
                <Badge
                  variant="outline"
                  className="ml-2 bg-red-500/10 text-red-500 border-red-500/20"
                >
                  {leaveRequests.filter((r) => r.status === 'rejected').length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {filteredLeaveRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <Calendar size={48} className="text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No pending leave requests</h3>
                    <p className="text-muted-foreground text-center">
                      There are no pending leave requests at the moment.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredLeaveRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Users size={20} className="text-primary" />
                              <h3 className="text-lg font-medium">{request.managerName}</h3>
                              <Badge
                                variant="outline"
                                className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                              >
                                Pending
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-muted-foreground" />
                              <span>
                                {new Date(request.startDate).toLocaleDateString()} to{' '}
                                {new Date(request.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              <span className="font-medium">Reason:</span> {request.reason}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock size={16} />
                              <span>
                                Requested: {new Date(request.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleApproveLeave(request.id)}
                                disabled={processingAction}
                              >
                                <CheckCircle size={16} className="mr-2" />
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
                                    <XCircle size={16} className="mr-2" />
                                    Reject
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Reject Leave Request</DialogTitle>
                                    <DialogDescription>
                                      Please provide a reason for rejecting this leave request.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="reason">Reason</Label>
                                      <Textarea
                                        id="reason"
                                        placeholder="Enter rejection reason"
                                        value={rejectionReason}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                          setRejectionReason(e.target.value)
                                        }
                                        rows={4}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      variant="destructive"
                                      onClick={handleRejectLeave}
                                      disabled={!rejectionReason.trim() || processingAction}
                                    >
                                      {processingAction ? 'Rejecting...' : 'Reject Request'}
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              {filteredLeaveRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <Calendar size={48} className="text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No approved leave requests</h3>
                    <p className="text-muted-foreground text-center">
                      There are no approved leave requests at the moment.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredLeaveRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Users size={20} className="text-primary" />
                              <h3 className="text-lg font-medium">{request.managerName}</h3>
                              <Badge
                                variant="outline"
                                className="bg-green-500/10 text-green-500 border-green-500/20"
                              >
                                Approved
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-muted-foreground" />
                              <span>
                                {new Date(request.startDate).toLocaleDateString()} to{' '}
                                {new Date(request.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              <span className="font-medium">Reason:</span> {request.reason}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock size={16} />
                              <span>
                                Requested: {new Date(request.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <CheckCircle size={16} className="text-green-500" />
                              <span>
                                Approved: {new Date(request.approvedAt!).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="mt-6">
              {filteredLeaveRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <Calendar size={48} className="text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No rejected leave requests</h3>
                    <p className="text-muted-foreground text-center">
                      There are no rejected leave requests at the moment.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredLeaveRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Users size={20} className="text-primary" />
                              <h3 className="text-lg font-medium">{request.managerName}</h3>
                              <Badge
                                variant="outline"
                                className="bg-red-500/10 text-red-500 border-red-500/20"
                              >
                                Rejected
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={16} className="text-muted-foreground" />
                              <span>
                                {new Date(request.startDate).toLocaleDateString()} to{' '}
                                {new Date(request.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              <span className="font-medium">Reason:</span> {request.reason}
                            </p>
                            {request.rejectionReason && (
                              <p className="text-sm text-red-500 mt-2">
                                <span className="font-medium">Rejection reason:</span>{' '}
                                {request.rejectionReason}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock size={16} />
                              <span>
                                Requested: {new Date(request.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <XCircle size={16} className="text-red-500" />
                              <span>
                                Rejected: {new Date(request.rejectedAt!).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ManagersPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Managers</h1>
          <p className="text-muted-foreground">Manage and monitor project managers</p>
        </div>
        <div className="h-10 w-36 bg-gray-200 animate-pulse rounded" />
      </div>

      <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
      <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array(6)
          .fill(0)
          .map((_, _i) => (
            <div key={i} className="border rounded-lg p-4 h-full">
              <div className="pb-2 border-b mb-4">
                <div className="flex justify-between items-start">
                  <div className="h-6 w-32 bg-gray-200 animate-pulse rounded" />
                  <div className="h-6 w-16 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="h-4 w-48 mt-2 bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-muted-foreground" />
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-muted-foreground" />
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
                  <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
