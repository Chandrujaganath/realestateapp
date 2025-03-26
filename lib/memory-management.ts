'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import type React from 'react';

// Utility for managing memory in long-running applications

// LRU Cache implementation
export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;
  private keyOrder: K[];

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map<K, V>();
    this.keyOrder = [];
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    // Move key to the end (most recently used)
    this.keyOrder = this.keyOrder.filter((k) => k !== key);
    this.keyOrder.push(key);

    return this.cache.get(key);
  }

  put(key: K, value: V): void {
    // If key already exists, update its position
    if (this.cache.has(key)) {
      this.keyOrder = this.keyOrder.filter((k) => k !== key);
    }
    // If cache is full, remove least recently used item
    else if (this.cache.size >= this.capacity) {
      const lruKey = this.keyOrder.shift();
      if (lruKey !== undefined) {
        this.cache.delete(lruKey);
      }
    }

    // Add new key-value pair
    this.cache.set(key, value);
    this.keyOrder.push(key);
  }

  clear(): void {
    this.cache.clear();
    this.keyOrder = [];
  }

  size(): number {
    return this.cache.size;
  }
}

// Resource cleanup utility
export function useResourceCleanup<
  T extends { dispose?: () => void; close?: () => void; cleanup?: () => void },
>(resource: T | null | undefined, deps: React.DependencyList = []) {
  useEffect(() => {
    return () => {
      if (!resource) return;

      if (typeof resource.dispose === 'function') {
        resource.dispose();
      } else if (typeof resource.close === 'function') {
        resource.close();
      } else if (typeof resource.cleanup === 'function') {
        resource.cleanup();
      }
    };
  }, [resource, ...deps]);
}

// Memory usage monitoring
export function useMemoryMonitoring(intervalMs = 30000) {
  const [memoryUsage, setMemoryUsage] = useState<{
    jsHeapSizeLimit?: number;
    totalJSHeapSize?: number;
    usedJSHeapSize?: number;
  } | null>(null);

  useEffect(() => {
    // Check if performance.memory is available (Chrome only)
    const _canMonitor =
      typeof window !== 'undefined' &&
      'performance' in window &&
      'memory' in (window.performance as any);

    if (!_canMonitor) {
      console.warn('Memory monitoring is not supported in this browser');
      return;
    }

    const checkMemory = () => {
      const memory = (window.performance as any).memory;
      setMemoryUsage({
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        totalJSHeapSize: memory.totalJSHeapSize,
        usedJSHeapSize: memory.usedJSHeapSize,
      });

      // Log warning if memory usage is high
      const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      if (usageRatio > 0.8) {
        console.warn(`High memory usage: ${Math.round(usageRatio * 100)}% of heap limit`);
      }
    };

    // Initial check
    checkMemory();

    // Set up interval
    const _intervalId = setInterval(checkMemory, intervalMs);

    return () => {
      clearInterval(_intervalId);
    };
  }, [intervalMs]);

  return memoryUsage;
}
