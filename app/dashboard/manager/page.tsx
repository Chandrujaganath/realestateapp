'use client';

import {
  Building2,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  ClipboardList,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';

import { ImportantAnnouncementBanner } from '@/components/announcements/important-announcement-banner';
import { UserAnnouncements } from '@/components/announcements/user-announcements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';

// Define the Task interface locally since we're no longer importing from context
export interface Task {
  id: string;
  type: string;
  status: string;
  priority: string;
  assignedTo: string;
  requestedBy: string;
  requestorName: string;
  requestorRole: string;
  projectId: string;
  projectName: string;
  plotId?: string;
  plotNumber?: string;
  description: string;
  createdAt: Date;
  dueDate?: Date;
  completedAt?: Date;
  managerFeedback?: string;
}

// Define a wrapper for the auth hook with more specific types
function useManagerAuth() {
  const auth = useAuth();

  // Create wrapper functions that handle the type casting internally
  return {
    user: auth.user,
    getManagerTasks: async () => {
      if (!auth.getManagerTasks) return [];
      return (await auth.getManagerTasks()) as Task[];
    },
    isManagerClockedIn: async () => {
      if (!auth.isManagerClockedIn) return false;
      return await auth.isManagerClockedIn();
    },
    checkInManager: async () => {
      if (!auth.checkInManager) return;
      await auth.checkInManager();
    },
    checkOutManager: async () => {
      if (!auth.checkOutManager) return;
      await auth.checkOutManager();
    },
    isWithinGeofence: async (locationData: { latitude: number; longitude: number }) => {
      if (!auth.isWithinGeofence) return false;
      return auth.isWithinGeofence(locationData.latitude, locationData.longitude);
    },
  };
}

export default function ManagerDashboard() {
  const {
    user,
    getManagerTasks,
    isManagerClockedIn,
    checkInManager,
    checkOutManager,
    isWithinGeofence,
  } = useManagerAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [inProgressTasks, setInProgressTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [clockedIn, setClockedIn] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [withinGeofence, setWithinGeofence] = useState(false);
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Function to fetch tasks
  const fetchTasks = async () => {
    try {
      // Fetch tasks
      const fetchedTasks = await getManagerTasks();
      setTasks(fetchedTasks);

      // Filter tasks by status
      setPendingTasks(fetchedTasks.filter((task: Task) => task.status === 'pending'));
      setInProgressTasks(fetchedTasks.filter((task: Task) => task.status === 'in_progress'));
      setCompletedTasks(fetchedTasks.filter((task: Task) => task.status === 'completed'));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    const _fetchData = async () => {
      try {
        await fetchTasks();

        // Check if manager is clocked in
        const isClocked = await isManagerClockedIn();
        setClockedIn(isClocked);

        // Check if manager is within geofence (using current location if available)
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setPosition(pos);
              const locationData = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
              };
              isWithinGeofence(locationData).then((_isWithin) => setWithinGeofence(isWithin));
            },
            (error) => {
              console.error('Error getting location:', error);
              setWithinGeofence(false);
            }
          );
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getManagerTasks, isManagerClockedIn, isWithinGeofence]);

  // Function to get current location
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return null;
    }

    try {
      setLocationError(null);
      return new Promise<GeolocationPosition>((_resolve, _reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              setLocationError('Please enable location services to check in/out');
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              setLocationError('Location information is unavailable');
            } else if (error.code === error.TIMEOUT) {
              setLocationError('Location request timed out');
            } else {
              setLocationError('An unknown error occurred');
            }
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }, []);

  // Function to handle check-in
  const _handleCheckIn = async () => {
    try {
      setCheckingStatus(true);

      // First, get user's current location
      const currentPosition = await getCurrentLocation();
      setPosition(currentPosition);

      // If no location, show warning but still allow check-in
      if (!currentPosition) {
        toast({
          title: 'Location Warning',
          description:
            locationError ||
            'Could not determine your location. Check-in may be recorded without location data.',
          variant: 'default',
          className: 'bg-amber-50 border-amber-200 text-amber-700',
        });
      } else {
        const coords = {
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
        };

        const _inGeofence = await isWithinGeofence(coords);

        if (!inGeofence) {
          // If not in geofence, warn user but still allow check-in
          toast({
            title: 'Location Warning',
            description:
              'You appear to be outside the designated work area. Your check-in will still be recorded, but may be flagged for review.',
            variant: 'default',
            className: 'bg-amber-50 border-amber-200 text-amber-700',
          });
        }
      }

      // Perform check-in (without location parameter)
      await checkInManager();

      setClockedIn(true);

      toast({
        title: 'Checked In',
        description: 'You have successfully checked in for today.',
      });

      // Refresh tasks after check-in
      await fetchTasks();
    } catch (error) {
      console.error('Error checking in:', error);
      toast({
        title: 'Check-in Failed',
        description: 'There was an error recording your check-in. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  // Function to handle check-out
  const _handleCheckOut = async () => {
    try {
      setCheckingStatus(true);

      // Perform check-out
      await checkOutManager();

      setClockedIn(false);

      toast({
        title: 'Checked Out',
        description: `You have successfully checked out for today.`,
      });
    } catch (error) {
      console.error('Error checking out:', error);
      toast({
        title: 'Check-out Failed',
        description: 'There was an error recording your check-out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  // Modified loadStatusData to check if manager is clocked in
  const loadStatusData = useCallback(async () => {
    try {
      // Check if the manager is within a geofence
      const _geoEnabled = await getCurrentLocation()
        .then((pos) => {
          if (pos) {
            setPosition(pos);
            return isWithinGeofence({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          }
          return false;
        })
        .catch(() => false);

      setWithinGeofence(geoEnabled);

      // Check if the manager is already clocked in
      const isClocked = await isManagerClockedIn();
      setClockedIn(isClocked);
    } catch (error) {
      console.error('Error loading status data:', error);
    }
  }, [isManagerClockedIn, isWithinGeofence, getCurrentLocation]);

  // Refresh load status data on interval
  useEffect(() => {
    loadStatusData();

    const _statusInterval = setInterval(
      () => {
        loadStatusData();
      },
      5 * 60 * 1000
    ); // Check every 5 minutes

    return () => {
      clearInterval(statusInterval);
    };
  }, [loadStatusData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ImportantAnnouncementBanner />

      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.displayName || 'Manager'}</h1>
        <p className="text-muted-foreground">Monitor site activity and manage assigned tasks</p>
      </div>

      <UserAnnouncements />

      {/* Attendance Status Card */}
      <Card
        className={`glass-card ${clockedIn ? 'border-green-500 dark:border-green-700' : 'border-amber-500 dark:border-amber-700'}`}
      >
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-full ${clockedIn ? 'bg-green-100 dark:bg-green-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}
            >
              <Clock
                className={`h-6 w-6 ${clockedIn ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">Attendance Status</h2>
              <p
                className={`${clockedIn ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}
              >
                {clockedIn ? 'You are currently clocked in' : 'You are not clocked in'}
              </p>
            </div>
          </div>

          <Button
            variant={clockedIn ? 'destructive' : 'default'}
            onClick={clockedIn ? handleCheckOut : handleCheckIn}
            disabled={checkingStatus || (!withinGeofence && !clockedIn)}
          >
            {checkingStatus ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                {clockedIn ? 'Checking out...' : 'Checking in...'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Clock className="mr-2 h-4 w-4" />
                {clockedIn ? 'Clock Out' : 'Clock In'}
              </span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Task Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Total Tasks
            </CardTitle>
            <CardDescription>All assigned tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tasks.length}</p>
            <div className="mt-4">
              <Link href="/manager/tasks">
                <Button variant="outline" className="w-full glass-button">
                  View All Tasks
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Pending
            </CardTitle>
            <CardDescription>Tasks awaiting action</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingTasks.length}</p>
            <div className="mt-4">
              <Link href="/manager/tasks?status=pending">
                <Button variant="outline" className="w-full glass-button">
                  View Pending
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              In Progress
            </CardTitle>
            <CardDescription>Tasks being worked on</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{inProgressTasks.length}</p>
            <div className="mt-4">
              <Link href="/manager/tasks?status=in_progress">
                <Button variant="outline" className="w-full glass-button">
                  View In Progress
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Completed
            </CardTitle>
            <CardDescription>Finished tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{completedTasks.length}</p>
            <div className="mt-4">
              <Link href="/manager/tasks?status=completed">
                <Button variant="outline" className="w-full glass-button">
                  View Completed
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your most recent assigned tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-4 p-3 rounded-md hover:bg-background/50 transition-colors"
                >
                  <div
                    className={`p-2 rounded-full ${
                      task.type === 'visit_request'
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : task.type === 'sell_request'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-amber-100 dark:bg-amber-900/30'
                    }`}
                  >
                    {task.type === 'visit_request' ? (
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : task.type === 'sell_request' ? (
                      <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {task.type === 'visit_request'
                            ? 'Visit Request'
                            : task.type === 'sell_request'
                              ? 'Sell Request'
                              : task.type === 'client_query'
                                ? 'Client Query'
                                : 'Guest Assistance'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {task.projectName} {task.plotNumber ? `- Plot ${task.plotNumber}` : ''}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          task.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                            : task.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}
                      >
                        {task.status === 'pending'
                          ? 'Pending'
                          : task.status === 'in_progress'
                            ? 'In Progress'
                            : 'Completed'}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{task.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Link href={`/manager/tasks/${task.id}`}>
                        <Button variant="outline" size="sm" className="h-8 glass-button">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {tasks.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No tasks assigned yet</p>
                </div>
              )}

              <div className="mt-2">
                <Link href="/manager/tasks">
                  <Button className="w-full">View All Tasks</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Link href="/manager/attendance">
                <Button className="w-full justify-start">
                  <Clock className="mr-2 h-4 w-4" />
                  View Attendance History
                </Button>
              </Link>

              <Link href="/manager/leave">
                <Button variant="outline" className="w-full justify-start glass-button">
                  <Calendar className="mr-2 h-4 w-4" />
                  Request Leave
                </Button>
              </Link>

              <Link href="/manager/sell-requests">
                <Button variant="outline" className="w-full justify-start glass-button">
                  <Building2 className="mr-2 h-4 w-4" />
                  Manage Sell Requests
                </Button>
              </Link>

              <Link href="/manager/visit-requests">
                <Button variant="outline" className="w-full justify-start glass-button">
                  <Users className="mr-2 h-4 w-4" />
                  Review Visit Requests
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
