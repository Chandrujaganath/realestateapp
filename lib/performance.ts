'use client';

import { useEffect, useState } from 'react';

// Custom hook for lazy loading components
export function useLazyComponent<T>(importFunc: () => Promise<{ default: T }>) {
  const [Component, setComponent] = useState<T | null>(null);

  useEffect(() => {
    let isMounted = true;

    importFunc().then((module) => {
      if (isMounted) {
        setComponent(module.default);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [importFunc]);

  return Component;
}

// Function to optimize Firestore queries with pagination
export function createPaginatedQuery<T>(
  fetchFunction: (lastDoc: any, limit: number) => Promise<{ data: T[]; lastDoc: any }>,
  initialLimit = 10
) {
  return function usePaginatedData() {
    const [data, setData] = useState<T[]>([]);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadInitialData = async () => {
      setLoading(true);
      try {
        const result = await fetchFunction(null, initialLimit);
        setData(result.data);
        setLastDoc(result.lastDoc);
        setHasMore(result.data.length === initialLimit);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    const loadMore = async () => {
      if (!hasMore || loading) return;

      setLoading(true);
      try {
        const result = await fetchFunction(lastDoc, initialLimit);
        setData((_prev) => [..._prev, ...result.data]);
        setLastDoc(result.lastDoc);
        setHasMore(result.data.length === initialLimit);
      } catch (error) {
        console.error('Error loading more data:', error);
      } finally {
        setLoading(false);
      }
    };

    return { data, loading, hasMore, loadMore, loadInitialData };
  };
}

// Function to implement client-side caching
export function createCachedFetch(ttlMs: number = 5 * 60 * 1000) {
  const cache = new Map<string, { data: any; timestamp: number }>();

  return async function cachedFetch<T>(url: string, options?: RequestInit): Promise<T> {
    const cacheKey = `${url}-${JSON.stringify(options)}`;
    const now = Date.now();

    // Check if we have a valid cached response
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse && now - cachedResponse.timestamp < ttlMs) {
      return cachedResponse.data;
    }

    // If not cached or expired, fetch new data
    const _response = await fetch(url, options);
    const data = await _response.json();

    // Cache the new response
    cache.set(cacheKey, { data, timestamp: now });

    return data;
  };
}
