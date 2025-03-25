"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { getMessaging, getToken, onMessage } from "firebase/messaging"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "@/hooks/use-toast"

// Your Firebase messaging vapid key
const FIREBASE_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY

export function PushNotificationHandler() {
  const { user } = useAuth()
  const [permission, setPermission] = useState<NotificationPermission | null>(null)

  useEffect(() => {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications")
      return
    }

    // Check notification permission
    setPermission(Notification.permission)

    // Only proceed if user is logged in
    if (!user?.uid) return

    // Request permission and set up FCM
    const setupPushNotifications = async () => {
      try {
        // Request permission if not granted
        if (Notification.permission !== "granted") {
          const permission = await Notification.requestPermission()
          setPermission(permission)

          if (permission !== "granted") {
            console.log("Notification permission denied")
            return
          }
        }

        // Get FCM token
        const messaging = getMessaging()
        const currentToken = await getToken(messaging, {
          vapidKey: FIREBASE_VAPID_KEY,
        })

        if (currentToken) {
          // Save token to user document
          const userRef = doc(db, "users", user.uid)
          await updateDoc(userRef, {
            fcmToken: currentToken,
            fcmTokenUpdatedAt: new Date(),
            notificationsEnabled: true,
          })

          console.log("FCM token registered")
        } else {
          console.log("No FCM token available")
        }

        // Set up message handler for foreground notifications
        onMessage(messaging, (payload) => {
          console.log("Message received:", payload)

          // Display toast notification
          if (payload.notification) {
            toast({
              title: payload.notification.title,
              description: payload.notification.body,
              variant: "default",
            })
          }
        })
      } catch (error) {
        console.error("Error setting up push notifications:", error)
      }
    }

    setupPushNotifications()
  }, [user?.uid])

  // This component doesn't render anything visible
  return null
}

