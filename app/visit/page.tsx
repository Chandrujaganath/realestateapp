'use client';

import { Calendar, Clock, MapPin, Building2, Users, CheckCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export default function VisitPage() {
  const { user } = useAuth();

  // Placeholder visits data
  const visits = [
    {
      id: 1,
      projectId: 1,
      projectName: 'Sunrise Gardens',
      location: 'East Suburb, City',
      date: 'March 25, 2025',
      time: '10:00 AM',
      status: 'confirmed',
      clientName: user?.role === 'client' ? undefined : 'John Doe',
    },
    {
      id: 2,
      projectId: 2,
      projectName: 'Metropolitan Heights',
      location: 'Downtown, City',
      date: 'April 2, 2025',
      time: '2:30 PM',
      status: 'pending',
      clientName: user?.role === 'client' ? undefined : 'Jane Smith',
    },
    {
      id: 3,
      projectId: 3,
      projectName: 'Riverside Villas',
      location: 'Riverside District, City',
      date: 'April 10, 2025',
      time: '11:15 AM',
      status: 'confirmed',
      clientName: user?.role === 'client' ? undefined : 'Robert Johnson',
    },
  ];

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isManager = user?.role === 'manager';
  const isClient = user?.role === 'client';

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {isClient ? 'My Site Visits' : 'Visit Schedule'}
          </h1>
          <p className="text-muted-foreground">
            {isClient
              ? 'Schedule and manage your property site visits'
              : 'Manage client visits to project sites'}
          </p>
        </div>

        <div className="flex gap-4">
          {isClient && (
            <Link href="/visit/book">
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Book New Visit
              </Button>
            </Link>
          )}

          {(isAdmin || isManager) && (
            <Link href="/visit/schedule">
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Visit
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {visits.map((visit) => (
          <Card key={visit.id} className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{visit.projectName}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {visit.location}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  {visit.status === 'confirmed' ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-500">Confirmed</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-500">Pending</span>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{visit.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{visit.time}</span>
                  </div>
                  {(isAdmin || isManager) && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{visit.clientName}</span>
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

                  <Link href={`/visit/${visit.id}`}>
                    <Button>Visit Details</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {visits.length === 0 && (
          <Card className="glass-card">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No visits scheduled yet</p>
              {isClient && (
                <Link href="/visit/book">
                  <Button>Book Your First Visit</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
