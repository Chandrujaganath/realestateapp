'use client';

import { Bell, Calendar, Building2, FileText } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export default function AnnouncementPage() {
  const { user } = useAuth();

  // Placeholder announcements data
  const _announcements = [
    {
      id: 1,
      title: 'New Phase Launch: Sunrise Gardens',
      date: 'March 15, 2025',
      project: 'Sunrise Gardens',
      projectId: 1,
      summary:
        'We are excited to announce the launch of Phase 2 of Sunrise Gardens, featuring premium apartments with enhanced amenities.',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.',
    },
    {
      id: 2,
      title: 'Construction Update: Metropolitan Heights',
      date: 'March 10, 2025',
      project: 'Metropolitan Heights',
      projectId: 2,
      summary:
        'Construction of Metropolitan Heights has reached 90% completion. The project is on track for timely delivery.',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.',
    },
    {
      id: 3,
      title: 'New Amenities Added: Riverside Villas',
      date: 'March 5, 2025',
      project: 'Riverside Villas',
      projectId: 3,
      summary:
        'We have added new amenities to Riverside Villas, including a tennis court and expanded clubhouse facilities.',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.',
    },
    {
      id: 4,
      title: 'Holiday Schedule: Site Visits',
      date: 'March 1, 2025',
      project: 'All Projects',
      projectId: null,
      summary:
        'Please note our modified schedule for site visits during the upcoming holiday season.',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.',
    },
    {
      id: 5,
      title: 'Annual Maintenance: Green Valley',
      date: 'February 25, 2025',
      project: 'Green Valley',
      projectId: 4,
      summary: 'Annual maintenance work will be carried out at Green Valley from March 5-10, 2025.',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.',
    },
  ];

  const _isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const _isManager = user?.role === 'manager';

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Announcements</h1>
          <p className="text-muted-foreground">Latest updates and news about our projects</p>
        </div>

        {(_isAdmin || _isManager) && (
          <Link href="/announcement/create">
            <Button>
              <Bell className="mr-2 h-4 w-4" />
              Create Announcement
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {_announcements.map((announcement) => (
          <Card key={announcement.id} className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{announcement.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {announcement.date}
                  </CardDescription>
                </div>
                {announcement.projectId && (
                  <Link href={`/project/${announcement.projectId}`}>
                    <Button variant="outline" size="sm" className="glass-button">
                      <Building2 className="mr-2 h-3 w-3" />
                      {announcement.project}
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{announcement.summary}</p>
              <div className="flex justify-end">
                <Link href={`/announcement/${announcement.id}`}>
                  <Button variant="outline" className="glass-button">
                    <FileText className="mr-2 h-4 w-4" />
                    Read More
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
