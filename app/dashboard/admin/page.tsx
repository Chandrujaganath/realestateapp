'use client';

import {
  Building2,
  Calendar,
  Users,
  Bell,
  BarChart3,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { ImportantAnnouncementBanner } from '@/components/announcements/important-announcement-banner';
import { UserAnnouncements } from '@/components/announcements/user-announcements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

// Define a Project interface for type checking
interface Project {
  id: string;
  status: string;
  // Add other properties as needed
}

export default function AdminDashboard() {
  const {
    user,
    getProjects,
    getVisitRequests,
    getManagers,
    getAllLeaveRequests,
    getAnnouncements,
  } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [pendingVisits, setPendingVisits] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [activeAnnouncements, setActiveAnnouncements] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const _fetchData = async () => {
      try {
        // Fetch analytics data
        const _analyticsData = await fetch('/api/analytics').then((_res) => _res.json());
        setAnalytics(_analyticsData);

        // Fetch pending visits
        if (getVisitRequests) {
          const visits = await getVisitRequests();
          const _pendingVisitsList = visits.filter((_visit: any) => _visit.status === 'pending');
          setPendingVisits(_pendingVisitsList.length);
        }

        // Fetch pending leave requests
        if (getAllLeaveRequests) {
          const _leaves = await getAllLeaveRequests();
          const _pendingLeavesList = _leaves.filter((_leave: any) => _leave.status === 'pending');
          setPendingLeaves(_pendingLeavesList.length);
        }

        // Fetch active projects
        if (getProjects) {
          const _projects = await getProjects();
          const active = _projects.filter((_project: Project) => _project.status === 'active');
          setActiveProjects(active.length);
        }

        // Fetch active announcements
        if (getAnnouncements) {
          const _announcements = await getAnnouncements();
          const active = _announcements.filter((_a: any) => _a.isPublished);
          setActiveAnnouncements(active.length);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    _fetchData();
  }, [getVisitRequests, getAllLeaveRequests, getProjects, getAnnouncements]);

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      <ImportantAnnouncementBanner />

      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.displayName || 'Admin'}</h1>
        <p className="text-muted-foreground">Manage projects, users, and monitor site activity</p>
      </div>

      <UserAnnouncements />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Users
            </CardTitle>
            <CardDescription>Total registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{analytics?.users?.total || 0}</p>
            <div className="mt-4">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full glass-button">
                  Manage Users
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Projects
            </CardTitle>
            <CardDescription>Active real estate projects</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeProjects}</p>
            <div className="mt-4">
              <Link href="/admin/projects">
                <Button variant="outline" className="w-full glass-button">
                  Manage Projects
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Visits
            </CardTitle>
            <CardDescription>Pending visit requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingVisits}</p>
            <div className="mt-4">
              <Link href="/admin/visit-requests">
                <Button variant="outline" className="w-full glass-button">
                  Review Requests
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Announcements
            </CardTitle>
            <CardDescription>Active announcements</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeAnnouncements}</p>
            <div className="mt-4">
              <Link href="/admin/announcements">
                <Button variant="outline" className="w-full glass-button">
                  Manage Announcements
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Link href="/admin/attendance" className="block">
          <Card className="glass-card transition-all hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Attendance Monitoring</h3>
                <p className="text-sm text-muted-foreground">
                  View and manage manager attendance records
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>System Analytics</CardTitle>
            <CardDescription>Key performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>New Users (This Month)</span>
                <span className="font-bold">{analytics?.users?.newLastWeek || 0}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{
                    width: `${analytics?.users?.newLastWeek ? (analytics.users.newLastWeek / analytics.users.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span>Visit Completion Rate</span>
                <span className="font-bold">
                  {analytics?.visits?.approved
                    ? Math.round((analytics.visits.approved / analytics.visits.total) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{
                    width: `${analytics?.visits?.approved ? (analytics.visits.approved / analytics.visits.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span>Manager Attendance Rate</span>
                <span className="font-bold">
                  {analytics?.managers?.attendanceRate
                    ? Math.round(analytics.managers.attendanceRate * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{
                    width: `${analytics?.managers?.attendanceRate ? analytics.managers.attendanceRate * 100 : 0}%`,
                  }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span>Plot Sales Progress</span>
                <span className="font-bold">
                  {analytics?.plots?.sold
                    ? Math.round((analytics.plots.sold / analytics.plots.total) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{
                    width: `${analytics?.plots?.sold ? (analytics.plots.sold / analytics.plots.total) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="mt-6">
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full glass-button">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Detailed Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Link href="/admin/projects/create">
                <Button className="w-full justify-start">
                  <Building2 className="mr-2 h-4 w-4" />
                  Create New Project
                </Button>
              </Link>

              <Link href="/admin/managers">
                <Button variant="outline" className="w-full justify-start glass-button">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Staff
                </Button>
              </Link>

              <Link href="/admin/announcements/create">
                <Button variant="outline" className="w-full justify-start glass-button">
                  <Bell className="mr-2 h-4 w-4" />
                  Create Announcement
                </Button>
              </Link>

              <Link href="/admin/leave-requests">
                <Button variant="outline" className="w-full justify-start glass-button">
                  <Calendar className="mr-2 h-4 w-4" />
                  Review Leave Requests
                  {pendingLeaves > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                      {pendingLeaves}
                    </span>
                  )}
                </Button>
              </Link>

              <Link href="/admin/settings">
                <Button variant="outline" className="w-full justify-start glass-button">
                  <Settings className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Visit Request Approved</p>
                <p className="text-sm text-muted-foreground">
                  Admin approved visit request for Jane Guest to Metropolitan Heights
                </p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Project Status Update</p>
                <p className="text-sm text-muted-foreground">
                  Project Sunrise Gardens updated to 75% completion
                </p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">New Announcement</p>
                <p className="text-sm text-muted-foreground">
                  Admin published \"New Phase Launch" announcement
                </p>
                <p className="text-xs text-muted-foreground">Yesterday</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <XCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Leave Request Rejected</p>
                <p className="text-sm text-muted-foreground">
                  Admin rejected leave request from Bob Manager
                </p>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and management</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Card key={index} className="glass-card">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1].map((index) => (
          <Card key={index} className="glass-card">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[0, 1, 2, 3].map((innerIndex) => (
                <div key={innerIndex}>
                  <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-2.5 w-full" />
                </div>
              ))}
              <Skeleton className="h-10 w-full mt-6" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="flex items-start gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
