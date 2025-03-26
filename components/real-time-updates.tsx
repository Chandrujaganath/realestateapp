'use client';

import { formatDistanceToNow } from 'date-fns';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  Firestore,
} from 'firebase/firestore';
import { Bell, Check, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: any;
  read: boolean;
  referenceId?: string;
  referenceType?: string;
}

export function RealTimeNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    // Make sure Firestore is initialized
    if (!db) {
      console.error('Firestore not initialized');
      setLoading(false);
      return;
    }

    // Set up real-time listener for notifications
    const _notificationsQuery = query(
      collection(db as Firestore, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const _unsubscribe = onSnapshot(
      notificationsQuery,
      (_snapshot) => {
        const newNotifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];

        setNotifications(newNotifications);
        setLoading(false);

        // Show toast for new unread notifications
        const newUnread = newNotifications.filter(
          (notification) =>
            !notification.read &&
            // Only show toast for notifications created in the last minute
            notification.createdAt &&
            Date.now() - notification.createdAt.toMillis() < 60000
        );

        if (newUnread.length > 0) {
          newUnread.forEach((notification) => {
            toast({
              title: notification.title,
              description: notification.message,
              variant: 'default',
            });
          });
        }
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const _markAsRead = async (notificationId: string) => {
    try {
      const _response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const _getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <Clock className="h-4 w-4" />;
      case 'approval':
        return <Check className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const _getNotificationColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'approval':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'alert':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Loading your notifications...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((_i) => (
              <div key={i} className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Your latest updates and alerts</CardDescription>
          </div>
          {notifications.filter((n) => !n.read).length > 0 && (
            <Badge variant="outline" className="ml-2">
              {notifications.filter((n) => !n.read).length} new
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg ${!notification.read ? 'bg-muted/50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {notification.createdAt
                          ? formatDistanceToNow(notification.createdAt.toDate(), {
                              addSuffix: true,
                            })
                          : 'Just now'}
                      </span>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {notifications.length > 0 && (
        <CardFooter className="flex justify-center border-t pt-4">
          <Button variant="outline" size="sm">
            View all notifications
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
