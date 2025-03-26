'use client';

import { formatDistanceToNow } from 'date-fns';
import { Calendar, Users, Building, Map, Activity } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

import { ImportantAnnouncementBanner } from '@/components/announcements/important-announcement-banner';
import { UserAnnouncements } from '@/components/announcements/user-announcements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSuperAdmin } from '@/contexts/super-admin-context';
import { useAuth } from '@/hooks/use-auth';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const { dashboardStats, loadingDashboardStats, getDashboardStats } = useSuperAdmin();

  useEffect(() => {
    console.log('SuperAdminDashboard - Current user:', user);
    console.log('SuperAdminDashboard - User role:', user?.role);

    const _fetchDashboardData = async () => {
      try {
        if (user && user.role?.toLowerCase() === 'superadmin') {
          console.log('SuperAdminDashboard - User is superadmin, fetching dashboard stats');
          await getDashboardStats();
        } else {
          console.log('SuperAdminDashboard - User is not superadmin or not authenticated');
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    // Only fetch dashboard stats if we have a user and that user is a superadmin
    if (user) {
      fetchDashboardData();
    }

    // Include getDashboardStats in the dependency array, but wrap it in useCallback in the SuperAdminProvider
  }, [user, getDashboardStats]);

  const _isSuperAdmin =
    user && (user.role?.toLowerCase() === 'superadmin' || user.role === 'SuperAdmin');

  if (!user) {
    console.log('SuperAdminDashboard - No user found, showing unauthorized screen');
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/login">Go to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isSuperAdmin) {
    console.log('SuperAdminDashboard - User role is not superadmin:', user.role);
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Unauthorized Access</CardTitle>
            <CardDescription>
              You need superadmin privileges to access this page. Current role:{' '}
              {user.role || 'No role assigned'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <ImportantAnnouncementBanner />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/superadmin/admins">Manage Admins</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/superadmin/settings">System Settings</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/superadmin/announcements">Announcements</Link>
          </Button>
        </div>
      </div>

      <UserAnnouncements />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingDashboardStats ? (
          <>
            <Skeleton className="h-[120px] rounded-lg" />
            <Skeleton className="h-[120px] rounded-lg" />
            <Skeleton className="h-[120px] rounded-lg" />
            <Skeleton className="h-[120px] rounded-lg" />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats?.userCounts.total || 0}</div>
                <p className="text-xs text-muted-foreground">Across all roles</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats?.projectStats.total || 0}</div>
                <p className="text-xs text-muted-foreground">Active real estate projects</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Available Plots</CardTitle>
                <Map className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.projectStats.activePlots || 0}
                </div>
                <p className="text-xs text-muted-foreground">Ready for sale</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Visits</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardStats?.projectStats.pendingVisits || 0}
                </div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown of users by role</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {loadingDashboardStats ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    {/* Placeholder for chart - in a real app, use a chart library */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                      {Object.entries(dashboardStats?.userCounts.byRole || {}).map(
                        ([role, count]) => (
                          <div key={role} className="flex items-center justify-between">
                            <span>{role}</span>
                            <span className="font-bold">{count}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Plot Status</CardTitle>
                <CardDescription>Available vs. Sold plots</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {loadingDashboardStats ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    {/* Placeholder for chart - in a real app, use a chart library */}
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="flex items-center justify-between">
                        <span>Available</span>
                        <span className="font-bold">
                          {dashboardStats?.projectStats.activePlots || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Sold</span>
                        <span className="font-bold">
                          {dashboardStats?.projectStats.soldPlots || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Overview of all users in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(dashboardStats?.userCounts.byRole || {}).map(([role, count]) => (
                    <Card key={role}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{role}s</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{count}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button asChild>
                    <Link href="/dashboard/superadmin/admins">Manage Admins</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingDashboardStats ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardStats?.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 border-b pb-4">
                      <Activity className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {activity.performedBy.name} ({activity.performedBy.role})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.actionType} on {activity.targetResource.type}
                          {activity.targetResource.name ? ` "${activity.targetResource.name}"` : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(activity.timestamp)} ago
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <Button asChild variant="outline">
                      <Link href="/dashboard/superadmin/audit-logs">View All Logs</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
