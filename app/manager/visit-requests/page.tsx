'use client';

import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import BackButton from '@/components/back-button';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

// Define visit type
interface Visit {
  id: string;
  projectId: string;
  projectName: string;
  plotId?: string;
  plotNumber?: string;
  guestId: string;
  guestName: string;
  guestEmail?: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  visitDate: Date | string;
  timeSlot: string;
  notes?: string;
  createdAt: Date | string;
}

export default function VisitRequestsPage() {
  const { user, getVisitRequests, approveVisitRequest, rejectVisitRequest } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    const _fetchVisits = async () => {
      try {
        if (getVisitRequests) {
          const _allVisits = await getVisitRequests();
          setVisits(allVisits);
        } else {
          // Mock data for development
          setVisits([
            {
              id: 'visit1',
              projectId: 'proj1',
              projectName: 'Sunrise Gardens',
              plotId: 'plot1',
              plotNumber: 'A-123',
              guestId: 'user1',
              guestName: 'John Doe',
              guestEmail: 'john@example.com',
              status: 'pending',
              visitDate: new Date(Date.now() + 86400000), // Tomorrow
              timeSlot: '10:00 AM',
              createdAt: new Date(),
            },
            {
              id: 'visit2',
              projectId: 'proj1',
              projectName: 'Sunrise Gardens',
              guestId: 'user2',
              guestName: 'Jane Smith',
              status: 'approved',
              visitDate: new Date(Date.now() + 172800000), // Day after tomorrow
              timeSlot: '2:00 PM',
              createdAt: new Date(),
            },
            {
              id: 'visit3',
              projectId: 'proj2',
              projectName: 'Metropolitan Heights',
              plotId: 'plot3',
              plotNumber: 'B-456',
              guestId: 'user3',
              guestName: 'Bob Johnson',
              status: 'completed',
              visitDate: new Date(Date.now() - 86400000), // Yesterday
              timeSlot: '3:00 PM',
              createdAt: new Date(Date.now() - 259200000), // 3 days ago
            },
            {
              id: 'visit4',
              projectId: 'proj2',
              projectName: 'Metropolitan Heights',
              guestId: 'user4',
              guestName: 'Alice Brown',
              status: 'cancelled',
              visitDate: new Date(Date.now() - 172800000), // 2 days ago
              timeSlot: '11:00 AM',
              createdAt: new Date(Date.now() - 432000000), // 5 days ago
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching visit requests:', error);
        toast({
          title: 'Error',
          description: 'Failed to load visit requests',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [getVisitRequests]);

  const filteredVisits = visits.filter((visit) => {
    if (activeTab === 'all') return true;
    return visit.status === activeTab;
  });

  const _handleApproveVisit = async () => {
    if (!selectedVisit) return;

    setProcessingAction(true);
    try {
      if (approveVisitRequest) {
        await approveVisitRequest(selectedVisit.id);
      }

      // Update local state
      setVisits((prev) =>
        prev.map((visit) =>
          visit.id === selectedVisit.id ? { ...visit, status: 'approved' } : visit
        )
      );

      toast({
        title: 'Visit Approved',
        description: 'The visit request has been approved',
      });
    } catch (error) {
      console.error('Error approving visit:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve visit request',
        variant: 'destructive',
      });
    } finally {
      setProcessingAction(false);
      setConfirmDialogOpen(false);
      setSelectedVisit(null);
    }
  };

  const _handleRejectVisit = async () => {
    if (!selectedVisit) return;

    setProcessingAction(true);
    try {
      if (rejectVisitRequest) {
        await rejectVisitRequest(selectedVisit.id, rejectionReason);
      }

      // Update local state
      setVisits((prev) =>
        prev.map((visit) =>
          visit.id === selectedVisit.id ? { ...visit, status: 'cancelled' } : visit
        )
      );

      toast({
        title: 'Visit Rejected',
        description: 'The visit request has been rejected',
      });
    } catch (error) {
      console.error('Error rejecting visit:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject visit request',
        variant: 'destructive',
      });
    } finally {
      setProcessingAction(false);
      setRejectDialogOpen(false);
      setSelectedVisit(null);
      setRejectionReason('');
    }
  };

  const _getStatusBadge = (status: Visit['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400"
          >
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge
            variant="outline"
            className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
          >
            Approved
          </Badge>
        );
      case 'completed':
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
          >
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge
            variant="outline"
            className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
          >
            Cancelled
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8">
      <BackButton href="/dashboard/manager" label="Back to Dashboard" />

      <div>
        <h1 className="text-3xl font-bold mb-2">Visit Requests</h1>
        <p className="text-muted-foreground">Manage client visit requests to properties</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Requests</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredVisits.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold mb-2">No Visits Found</h2>
                <p className="text-muted-foreground max-w-md">
                  {activeTab === 'pending'
                    ? 'There are no pending visit requests to review.'
                    : activeTab === 'approved'
                      ? 'There are no approved visits scheduled.'
                      : activeTab === 'completed'
                        ? 'There are no completed visits.'
                        : 'There are no visit requests.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredVisits.map((visit) => (
                <Card key={visit.id} className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(visit.status)}
                          <h3 className="font-bold">{visit.projectName}</h3>
                        </div>

                        <div className="grid gap-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {format(
                                typeof visit.visitDate === 'string'
                                  ? new Date(visit.visitDate)
                                  : visit.visitDate,
                                'PPP'
                              )}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{visit.timeSlot}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{visit.guestName}</span>
                            {visit.guestEmail && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">{visit.guestEmail}</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{visit.projectName}</span>
                            {visit.plotNumber && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span>Plot {visit.plotNumber}</span>
                              </>
                            )}
                          </div>

                          {visit.notes && (
                            <div className="text-sm mt-2 bg-background/50 p-2 rounded-md">
                              <p className="text-muted-foreground font-medium mb-1">Notes:</p>
                              <p>{visit.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {visit.status === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedVisit(visit);
                                setConfirmDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedVisit(visit);
                                setRejectDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}

                        {visit.status === 'approved' && (
                          <Button variant="outline" size="sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Approve Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Visit Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this visit request? This will notify the client and
              generate a QR code for them.
            </DialogDescription>
          </DialogHeader>

          {selectedVisit && (
            <div className="bg-background/50 p-3 rounded-md space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selectedVisit.guestName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(
                    typeof selectedVisit.visitDate === 'string'
                      ? new Date(selectedVisit.visitDate)
                      : selectedVisit.visitDate,
                    'PPP'
                  )}
                </span>
                <span className="text-muted-foreground">•</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{selectedVisit.timeSlot}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{selectedVisit.projectName}</span>
                {selectedVisit.plotNumber && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <span>Plot {selectedVisit.plotNumber}</span>
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={processingAction}
            >
              Cancel
            </Button>
            <Button onClick={handleApproveVisit} disabled={processingAction}>
              {processingAction ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Approve Visit
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Visit Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this visit request. This information will be
              shared with the client.
            </DialogDescription>
          </DialogHeader>

          {selectedVisit && (
            <div className="bg-background/50 p-3 rounded-md space-y-1 text-sm mb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{selectedVisit.guestName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {format(
                    typeof selectedVisit.visitDate === 'string'
                      ? new Date(selectedVisit.visitDate)
                      : selectedVisit.visitDate,
                    'PPP'
                  )}
                </span>
                <span className="text-muted-foreground">•</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{selectedVisit.timeSlot}</span>
              </div>
            </div>
          )}

          <Textarea
            placeholder="Reason for rejection (e.g. 'No staff available at the requested time')"
            value={rejectionReason}
            onChange={(_e) => setRejectionReason(e.target.value)}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={processingAction}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectVisit}
              disabled={processingAction || !rejectionReason.trim()}
            >
              {processingAction ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Reject Visit
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
