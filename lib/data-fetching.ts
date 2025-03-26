'use client';

import { useEffect } from 'react';
import useSWR, { type SWRConfiguration } from 'swr';

import { useOnlineStatus } from '@/lib/offline';

// Fetcher function for SWR
const _defaultFetcher = async (_url: string) => {
  const res = await fetch(_url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    error.message = await res.text();
    throw error;
  }
  return res.json();
};

// Custom hook for data fetching with SWR and offline support
export function useData<T>(
  key: string | null,
  fetcher = _defaultFetcher,
  config: SWRConfiguration = {}
) {
  const isOnline = useOnlineStatus();

  // Use SWR for data fetching
  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(key, fetcher, {
    revalidateOnFocus: isOnline,
    revalidateOnReconnect: true,
    errorRetryCount: isOnline ? 3 : 0,
    ...config,
  });

  // Save data to localStorage when it changes
  useEffect(() => {
    if (key && data) {
      try {
        localStorage.setItem(
          `data_cache_${key}`,
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        console.error('Failed to save data to localStorage', e);
      }
    }
  }, [key, data]);

  // Load data from localStorage when offline
  useEffect(() => {
    if (!isOnline && key && !data && !isValidating) {
      try {
        const cachedData = localStorage.getItem(`data_cache_${key}`);
        if (cachedData) {
          const { data: localData } = JSON.parse(cachedData);
          mutate(localData, false);
        }
      } catch (e) {
        console.error('Failed to load data from localStorage', e);
      }
    }
  }, [isOnline, key, data, isValidating, mutate]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    isOffline: !isOnline && !data,
  };
}
