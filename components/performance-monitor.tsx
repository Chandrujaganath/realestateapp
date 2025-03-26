'use client';

import { useEffect } from 'react';

import { collectPerformanceMetrics } from '@/lib/performance-monitoring';

export function PerformanceMonitor() {
  useEffect(() => {
    // Wait for the page to fully load
    if (document.readyState === 'complete') {
      captureMetrics();
    } else {
      window.addEventListener('load', captureMetrics);
      return () => window.removeEventListener('load', captureMetrics);
    }
  }, []);

  const captureMetrics = () => {
    // Wait a bit to ensure all metrics are available
    setTimeout(() => {
      const _metrics = collectPerformanceMetrics();

      // In a real app, you would send these metrics to your analytics service
      console.log('Page performance metrics:', metrics);

      // Example: Send to a hypothetical analytics endpoint
      // fetch('/api/analytics/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(metrics)
      // })
    }, 1000);
  };

  return null; // This component doesn't render anything
}
