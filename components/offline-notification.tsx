"use client"

import { useOnlineStatus } from "@/lib/offline"
import { Wifi, WifiOff } from "lucide-react"
import { useEffect, useState } from "react"

export function OfflineNotification() {
  const isOnline = useOnlineStatus()
  const [showOffline, setShowOffline] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true)
      setShowReconnected(false)
    } else if (showOffline) {
      setShowOffline(false)
      setShowReconnected(true)

      const timer = setTimeout(() => {
        setShowReconnected(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isOnline, showOffline])

  if (!showOffline && !showReconnected) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      {showOffline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 flex items-center shadow-lg rounded-md">
          <WifiOff className="h-5 w-5 mr-2" />
          <div>
            <p className="font-bold">You are offline</p>
            <p className="text-sm">Some features may be limited until you reconnect</p>
          </div>
        </div>
      )}

      {showReconnected && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 flex items-center shadow-lg rounded-md">
          <Wifi className="h-5 w-5 mr-2" />
          <div>
            <p className="font-bold">You are back online</p>
            <p className="text-sm">All features are now available</p>
          </div>
        </div>
      )}
    </div>
  )
}

