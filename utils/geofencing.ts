interface GeofencePoint {
  latitude: number
  longitude: number
}

interface GeofenceConfig {
  center: GeofencePoint
  radius: number // in meters
}

// Mock project geofence configurations
const projectGeofences: Record<string, GeofenceConfig> = {
  "project-1": {
    center: { latitude: 37.7749, longitude: -122.4194 }, // Example: San Francisco
    radius: 100, // 100 meters
  },
  "project-2": {
    center: { latitude: 34.0522, longitude: -118.2437 }, // Example: Los Angeles
    radius: 150, // 150 meters
  },
  "project-3": {
    center: { latitude: 40.7128, longitude: -74.006 }, // Example: New York
    radius: 120, // 120 meters
  },
}

/**
 * Calculate the distance between two points using the Haversine formula
 * @param point1 First point with latitude and longitude
 * @param point2 Second point with latitude and longitude
 * @returns Distance in meters
 */
export function calculateDistance(point1: GeofencePoint, point2: GeofencePoint): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180
  const φ2 = (point2.latitude * Math.PI) / 180
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance
}

/**
 * Check if a point is within a geofence
 * @param point Point to check
 * @param geofence Geofence configuration
 * @returns Boolean indicating if the point is within the geofence
 */
export function isPointInGeofence(point: GeofencePoint, geofence: GeofenceConfig): boolean {
  const distance = calculateDistance(point, geofence.center)
  return distance <= geofence.radius
}

/**
 * Get the current position of the device
 * @returns Promise that resolves to a GeofencePoint
 */
export function getCurrentPosition(): Promise<GeofencePoint> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      { enableHighAccuracy: true },
    )
  })
}

/**
 * Check if the current position is within a project's geofence
 * @param projectId ID of the project
 * @returns Promise that resolves to a boolean
 */
export async function checkIfInProjectGeofence(projectId: string): Promise<boolean> {
  try {
    // Get the project's geofence configuration
    const geofence = projectGeofences[projectId]
    if (!geofence) {
      throw new Error(`Geofence configuration not found for project ${projectId}`)
    }

    // Get the current position
    const currentPosition = await getCurrentPosition()

    // Check if the current position is within the geofence
    return isPointInGeofence(currentPosition, geofence)
  } catch (error) {
    console.error("Error checking geofence:", error)
    return false
  }
}

/**
 * Mock function to simulate geofence check for testing
 * @param projectId ID of the project
 * @returns Promise that resolves to a boolean
 */
export async function mockGeofenceCheck(projectId: string): Promise<boolean> {
  // For testing purposes, we'll return true for project-1 and false for others
  return projectId === "project-1"
}

