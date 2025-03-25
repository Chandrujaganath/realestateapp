importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js")

// Initialize Firebase
const firebaseApp = firebase.initializeApp({
  apiKey: self.FIREBASE_API_KEY,
  authDomain: self.FIREBASE_AUTH_DOMAIN,
  projectId: self.FIREBASE_PROJECT_ID,
  storageBucket: self.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID,
  appId: self.FIREBASE_APP_ID,
  measurementId: self.FIREBASE_MEASUREMENT_ID,
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Received background message:", payload)

  const { title, body } = payload.notification

  // Show notification
  self.registration.showNotification(title, {
    body,
    icon: "/logo.png",
    badge: "/badge.png",
    data: payload.data,
  })
})

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const { type, referenceId } = event.notification.data

  // Determine URL based on notification type
  let url = "/"

  switch (type) {
    case "visit":
      url = `/visits/${referenceId}`
      break
    case "task":
      url = `/tasks/${referenceId}`
      break
    case "announcement":
      url = `/announcements/${referenceId}`
      break
    case "sellRequest":
      url = `/sell-requests/${referenceId}`
      break
    default:
      url = "/dashboard"
  }

  // Open or focus the relevant page
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus()
        }
      }

      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    }),
  )
})

