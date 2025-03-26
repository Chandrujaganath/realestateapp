'use client';

import { doc, updateDoc, Firestore } from 'firebase/firestore';
import type { Messaging } from 'firebase/messaging';
import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { messaging } from '@/lib/firebase';
import { db } from '@/lib/firebase';

// Define UserType to avoid type errors
type UserType = {
  uid: string;
  [key: string]: any;
};

export function FirebaseMessaging() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [user, setUser] = useState<UserType | null>(null);

  // Wrap useAuth in try/catch since it might throw if used outside AuthProvider
  let auth = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    auth = useAuth();
  } catch (error) {
    console.error('Error using auth context in FirebaseMessaging:', error);
  }

  // Set user from auth in useEffect to avoid direct usage of potentially undefined auth
  useEffect(() => {
    if (auth?.user) {
      setUser(auth.user as UserType);
    }
  }, [auth?.user]);

  useEffect(() => {
    // Skip if we're not in a browser
    if (typeof window === 'undefined') return;

    // Skip if notifications aren't supported
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return;
    }

    // Skip if service workers aren't supported
    if (!('serviceWorker' in navigator)) {
      console.log('This browser does not support service workers');
      return;
    }

    // Check if user is logged in
    if (!user?.uid) return;

    // Check notification permission
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }

    // Function to asynchronously load messaging functionality
    const _setupMessaging = async () => {
      try {
        // Skip if messaging isn't initialized yet
        if (!messaging) {
          console.log('Firebase messaging not initialized yet');
          return;
        }

        // Dynamically import firebase messaging functions
        const { getToken, onMessage } = await import('firebase/messaging');

        // Request permission and get token
        const _requestPermissionAndGetToken = async () => {
          try {
            // Request permission
            const permission = await Notification.requestPermission();
            setPermission(permission);

            if (permission === 'granted') {
              // Get FCM token
              const token = await getToken(messaging as Messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
              });

              if (token && user?.uid && db) {
                // Save token to user document
                await updateDoc(doc(db as Firestore, 'users', user.uid), {
                  fcmToken: token,
                  updatedAt: new Date(),
                });

                console.log('FCM token saved to user document');
              }
            }
          } catch (error) {
            console.error('Error requesting notification permission:', error);
          }
        };

        await requestPermissionAndGetToken();

        // Handle foreground messages
        const unsubscribe = onMessage(messaging as Messaging, (payload) => {
          console.log('Received foreground message:', payload);

          const { notification } = payload;

          if (notification) {
            toast({
              title: notification.title || 'New Notification',
              description: notification.body,
              duration: 5000,
            });
          }
        });

        return () => {
          if (unsubscribe) unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up messaging:', error);
        return () => {}; // Return empty cleanup function
      }
    };

    // Setup messaging with delay to ensure DOM is ready
    const _timer = setTimeout(() => {
      setupMessaging();
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [user]);

  return null;
}
