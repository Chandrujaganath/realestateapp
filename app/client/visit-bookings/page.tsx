'use client';

import { format } from 'date-fns';
import {
  QrCode,
  Calendar,
  Clock,
  Building2,
  Map,
  FileText,
  AlertCircle,
  Sparkles,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

import BackButton from '@/components/back-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';

// Visit booking interface
interface VisitBooking {
  id: string;
  projectId: string;
  projectName: string;
  plotId?: string;
  plotNumber?: string;
  status: 'pending' | 'approved' | 'cancelled' | 'completed';
  visitDate: Date | string;
  timeSlot: string;
  notes?: string;
  rejection_reason?: string;
  qrCodeData?: string;
  createdAt: Date | string;
}

export default function ClientVisitBookingsPage() {
  const router = useRouter();
  const { user, getClientVisitBookings, cancelVisitBooking } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [bookings, setBookings] = useState<VisitBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<VisitBooking | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    const _fetchBookings = async () => {
      try {
        if (getClientVisitBookings) {
          const _myBookings = await getClientVisitBookings();
          setBookings(myBookings);
        } else {
          // Mock data for development
          setBookings([
            {
              id: 'booking1',
              projectId: 'proj1',
              projectName: 'Sunrise Gardens',
              plotId: 'plot123',
              plotNumber: 'A-123',
              status: 'pending',
              visitDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
              timeSlot: '10:00 AM',
              notes: 'I would like to see the model house as well.',
              createdAt: new Date(),
            },
            {
              id: 'booking2',
              projectId: 'proj1',
              projectName: 'Sunrise Gardens',
              plotId: 'plot124',
              plotNumber: 'A-124',
              status: 'approved',
              visitDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
              timeSlot: '2:00 PM',
              qrCodeData: 'visit:booking2:user1:approved',
              createdAt: new Date(Date.now() - 86400000), // 1 day ago
            },
            {
              id: 'booking3',
              projectId: 'proj2',
              projectName: 'Metropolitan Heights',
              status: 'cancelled',
              visitDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
              timeSlot: '3:30 PM',
              rejection_reason: 'No staff available at requested time',
              createdAt: new Date(Date.now() - 86400000 * 4), // 4 days ago
            },
            {
              id: 'booking4',
              projectId: 'proj3',
              projectName: 'Riverside Villas',
              plotId: 'plot456',
              plotNumber: 'B-456',
              status: 'completed',
              visitDate: new Date(Date.now() - 86400000 * 10), // 10 days ago
              timeSlot: '11:00 AM',
              createdAt: new Date(Date.now() - 86400000 * 15), // 15 days ago
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your visit bookings',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [getClientVisitBookings]);

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'all') return true;
    return booking.status === activeTab;
  });

  const _handleCancelBooking = async () => {
    if (!selectedBooking) return;

    setProcessingAction(true);
    try {
      if (cancelVisitBooking) {
        await cancelVisitBooking(selectedBooking.id);
      }

      // Update local state
      setBookings((_prev) =>
        prev.map((booking) =>
          booking.id === selectedBooking.id ? { ...booking, status: 'cancelled' } : booking
        )
      );

      toast({
        title: 'Booking Cancelled',
        description: 'Your visit booking has been cancelled',
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel your booking',
        variant: 'destructive',
      });
    } finally {
      setProcessingAction(false);
      setCancelDialogOpen(false);
      setSelectedBooking(null);
    }
  };

  const _getStatusBadge = (status: VisitBooking['status']) => {
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
      <BackButton href="/dashboard/client" label="Back to Dashboard" />

      <div>
        <h1 className="text-3xl font-bold mb-2">My Visit Bookings</h1>
        <p className="text-muted-foreground">Manage your property visit appointments</p>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={() => router.push('/visit/book')}>
          <Calendar className="h-4 w-4 mr-2" />
          Book New Visit
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-bold mb-2">No Bookings Found</h2>
                <p className="text-muted-foreground max-w-md">
                  {activeTab === 'all'
                    ? "You haven't booked any property visits yet."
                    : activeTab === 'pending'
                      ? "You don't have any pending visit requests."
                      : activeTab === 'approved'
                        ? 'No approved visits found.'
                        : activeTab === 'completed'
                          ? "You don't have any completed visits."
                          : 'No declined visits found.'}
                </p>
                <div className="mt-6">
                  <Button onClick={() => router.push('/visit/book')}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Book a Visit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(booking.status)}
                          <h3 className="font-bold">{booking.projectName}</h3>
                        </div>

                        <div className="grid gap-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {format(
                                typeof booking.visitDate === 'string'
                                  ? new Date(booking.visitDate)
                                  : booking.visitDate,
                                'PPP'
                              )}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.timeSlot}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{booking.projectName}</span>
                            {booking.plotNumber && (
                              <>
                                <span className="text-muted-foreground">•</span>
                                <span>Plot {booking.plotNumber}</span>
                              </>
                            )}
                          </div>

                          {booking.notes && (
                            <div className="text-sm mt-2 bg-background/50 p-2 rounded-md">
                              <p className="text-muted-foreground font-medium mb-1">My Notes:</p>
                              <p>{booking.notes}</p>
                            </div>
                          )}

                          {booking.rejection_reason && (
                            <div className="text-sm mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded-md text-red-800 dark:text-red-200">
                              <p className="font-medium mb-1">Reason for Cancellation:</p>
                              <p>{booking.rejection_reason}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {booking.status === 'approved' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setQrDialogOpen(true);
                            }}
                          >
                            <QrCode className="h-4 w-4 mr-1" />
                            View QR Code
                          </Button>
                        )}

                        {booking.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setCancelDialogOpen(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel Booking
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/project/${booking.projectId}`)}
                        >
                          <Map className="h-4 w-4 mr-1" />
                          View Project
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Visit QR Code</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="flex flex-col items-center space-y-6">
              <div className="bg-white p-4 rounded-lg">
                <QRCode
                  value={
                    selectedBooking.qrCodeData ||
                    `visit:${selectedBooking.id}:${user?.uid || 'user'}:approved`
                  }
                  size={200}
                />
              </div>

              <div className="space-y-4 w-full">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-center">Visit Details</h3>
                  <Separator />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedBooking.projectName}</span>
                    {selectedBooking.plotNumber && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span>Plot {selectedBooking.plotNumber}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(
                        typeof selectedBooking.visitDate === 'string'
                          ? new Date(selectedBooking.visitDate)
                          : selectedBooking.visitDate,
                        'PPP'
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedBooking.timeSlot}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md w-full">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                    Instructions
                  </h3>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Please present this QR code at the project site entrance. Our staff will scan it
                  to verify your approved visit.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Visit Booking</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <p>Are you sure you want to cancel this visit booking?</p>

              <div className="bg-background/50 p-3 rounded-md space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{selectedBooking.projectName}</span>
                  {selectedBooking.plotNumber && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span>Plot {selectedBooking.plotNumber}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(
                      typeof selectedBooking.visitDate === 'string'
                        ? new Date(selectedBooking.visitDate)
                        : selectedBooking.visitDate,
                      'PPP'
                    )}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedBooking.timeSlot}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCancelDialogOpen(false)}
                  disabled={processingAction}
                >
                  Keep Booking
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelBooking}
                  disabled={processingAction}
                >
                  {processingAction ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                      Cancelling...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Yes, Cancel Booking
                    </span>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
