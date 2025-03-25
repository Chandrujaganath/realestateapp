"use client"

import { useEffect, useState } from "react"

// Hook to detect online/offline status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return isOnline
}

// Function to queue operations when offline
export function createOfflineQueue() {
  const QUEUE_KEY = "offline_operation_queue"

  // Load queue from localStorage
  const loadQueue = (): Array<{ operation: string; data: any }> => {
    try {
      const savedQueue = localStorage.getItem(QUEUE_KEY)
      return savedQueue ? JSON.parse(savedQueue) : []
    } catch (e) {
      console.error("Failed to load offline queue", e)
      return []
    }
  }

  // Save queue to localStorage
  const saveQueue = (queue: Array<{ operation: string; data: any }>) => {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
    } catch (e) {
      console.error("Failed to save offline queue", e)
    }
  }

  // Add operation to queue
  const enqueue = (operation: string, data: any) => {
    const queue = loadQueue()
    queue.push({ operation, data })
    saveQueue(queue)
  }

  // Process queue when back online
  const processQueue = async (processors: Record<string, (data: any) => Promise<void>>) => {
    const queue = loadQueue()
    if (queue.length === 0) return

    const newQueue = []

    for (const item of queue) {
      try {
        const processor = processors[item.operation]
        if (processor) {
          await processor(item.data)
        } else {
          // Keep in queue if no processor found
          newQueue.push(item)
        }
      } catch (e) {
        console.error(`Failed to process offline operation: ${item.operation}`, e)
        // Keep failed operations in queue
        newQueue.push(item)
      }
    }

    saveQueue(newQueue)
  }

  return { enqueue, processQueue }
}

