'use client';

import { format } from 'date-fns';
import { Calendar, Clock, Building2, QrCode, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

interface Visit {
  id: string;
  projectId: string;
  projectName: string;
  plotId: string | null;
  plotNumber: string | null;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  visitDate: Date;
  timeSlot: string;
  qrCodeUrl: string | null;
  entryTime: Date | null;
  exitTime: Date | null;
}

export default function MyVisitsPage() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);

  useEffect(() => {
    const _fetchVisits = async () => {
      if (!user) return;

      try {
        // In a real implementation, fetch visits from Firestore
        // For now, we'll use mock data
        const _mockVisits: Visit[] = [
          {
            id: '1',
            projectId: '1',
            projectName: 'Sunrise Gardens',
            plotId: 'plot-12',
            plotNumber: '12',
            status: 'pending',
            visitDate: new Date(2025, 2, 25), // March 25, 2025
            timeSlot: '10:00 AM',
            qrCodeUrl: null,
            entryTime: null,
            exitTime: null,
          },
          {
            id: '2',
            projectId: '2',
            projectName: 'Metropolitan Heights',
            plotId: 'plot-5',
            plotNumber: '5',
            status: 'approved',
            visitDate: new Date(2025, 3, 2), // April 2, 2025
            timeSlot: '2:30 PM',
            qrCodeUrl: '/placeholder.svg?height=300&width=300',
            entryTime: null,
            exitTime: null,
          },
          {
            id: '3',
            projectId: '3',
            projectName: 'Riverside Villas',
            plotId: null,
            plotNumber: null,
            status: 'completed',
            visitDate: new Date(2025, 2, 10), // March 10, 2025
            timeSlot: '11:15 AM',
            qrCodeUrl: '/placeholder.svg?height=300&width=300',
            entryTime: new Date(2025, 2, 10, 11, 10), // 11:10 AM
            exitTime: new Date(2025, 2, 10, 12, 5), // 12:05 PM
          },
        ];

        setVisits(mockVisits);
      } catch (error) {
        console.error('Error fetching visits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisits();
  }, [user]);

  const _handleShowQrCode = (visit: Visit) => {
    setSelectedVisit(visit);
    setShowQrCode(true);
  };

  const _getStatusBadge = (status: Visit['status']) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Pending Approval</span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Approved</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <XCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Cancelled</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showQrCode && selectedVisit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Card className="glass-card max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Entry QR Code</CardTitle>
            <CardDescription>Show this QR code at the site entrance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg mb-4">
              <Image
                src={selectedVisit.qrCodeUrl || '/placeholder.svg?height=300&width=300'}
                alt="QR Code"
                width={250}
                height={250}
                className="mx-auto"
              />
            </div>

            <div className="w-full space-y-4">
              <div className="bg-background/50 backdrop-blur-sm rounded-md p-3">
                <p className="text-sm text-muted-foreground">Project</p>
                <p className="font-medium">{selectedVisit.projectName}</p>
              </div>

              <div className="bg-background/50 backdrop-blur-sm rounded-md p-3">
                <p className="text-sm text-muted-foreground">Visit Date & Time</p>
                <p className="font-medium">
                  {format(selectedVisit.visitDate, 'PPP')} at {selectedVisit.timeSlot}
                </p>
              </div>

              {selectedVisit.plotNumber && (
                <div className="bg-background/50 backdrop-blur-sm rounded-md p-3">
                  <p className="text-sm text-muted-foreground">Plot</p>
                  <p className="font-medium">Plot {selectedVisit.plotNumber}</p>
                </div>
              )}
            </div>

            <div className="mt-6 w-full">
              <Button
                variant="outline"
                className="w-full glass-button"
                onClick={() => setShowQrCode(false)}
              >
                Back to My Visits
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Visits</h1>
          <p className="text-muted-foreground">View and manage your scheduled site visits</p>
        </div>

        <Link href="/visit/book">
          <Button>
            <Calendar className="mr-2 h-4 w-4" />
            Book New Visit
          </Button>
        </Link>
      </div>

      {visits.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">You don't have any scheduled visits yet</p>
            <Link href="/visit/book">
              <Button>Book Your First Visit</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {visits.map((visit) => (
            <Card key={visit.id} className="glass-card">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{visit.projectName}</CardTitle>
                    <CardDescription>
                      {visit.plotNumber ? `Plot ${visit.plotNumber}` : 'General Visit'}
                    </CardDescription>
                  </div>
                  {getStatusBadge(visit.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{format(visit.visitDate, 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{visit.timeSlot}</span>
                    </div>
                    {visit.entryTime && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          Entry: {format(visit.entryTime, 'h:mm a')}
                          {visit.exitTime && ` • Exit: ${format(visit.exitTime, 'h:mm a')}`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/project/${visit.projectId}`}>
                      <Button variant="outline" className="glass-button">
                        <Building2 className="mr-2 h-4 w-4" />
                        View Project
                      </Button>
                    </Link>

                    {visit.status === 'approved' && visit.qrCodeUrl && (
                      <Button onClick={() => handleShowQrCode(visit)}>
                        <QrCode className="mr-2 h-4 w-4" />
                        Show QR Code
                      </Button>
                    )}

                    {visit.status === 'completed' && (
                      <Link href={`/visit/feedback/${visit.id}`}>
                        <Button>Submit Feedback</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
