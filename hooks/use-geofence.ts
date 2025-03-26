'use client';

import { useState, useEffect } from 'react';

import { checkIfInProjectGeofence, mockGeofenceCheck } from '@/utils/geofencing';

interface UseGeofenceOptions {
  projectId: string;
  interval?: number; // Check interval in milliseconds
  useMock?: boolean; // Whether to use mock data for testing
}

export function useGeofence({ projectId, interval = 60000, useMock = true }: UseGeofenceOptions) {
  const [isWithinGeofence, setIsWithinGeofence] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const checkGeofence = async () => {
      try {
        setLoading(true);

        // Use mock data for testing if specified
        const _isWithin = useMock
          ? await mockGeofenceCheck(projectId)
          : await checkIfInProjectGeofence(projectId);

        setIsWithinGeofence(isWithin);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error checking geofence'));
        console.error('Error checking geofence:', err);
      } finally {
        setLoading(false);
      }
    };

    // Initial check
    checkGeofence();

    // Set up interval for periodic checks
    intervalId = setInterval(checkGeofence, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [projectId, interval, useMock]);

  return { isWithinGeofence, loading, error };
}
