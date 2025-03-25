"use client"

import { useEffect } from "react"

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", async () => {
        try {
          // Register the service worker
          const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
            scope: "/",
          })

          console.log("Service Worker registered with scope:", registration.scope)

          // Pass Firebase config to service worker
          if (registration.active) {
            registration.active.postMessage({
              type: "FIREBASE_CONFIG",
              config: {
                FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
                FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
              },
            })
          }
        } catch (error) {
          console.error("Service Worker registration failed:", error)
        }
      })
    }
  }, [])

  return null
}

