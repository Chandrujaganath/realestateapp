// Simple performance monitoring utility

// Interface for performance metrics
export interface PerformanceMetrics {
  pageLoadTime?: number;
  ttfb?: number; // Time to First Byte
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
}

// Function to collect performance metrics
export function collectPerformanceMetrics(): PerformanceMetrics {
  if (typeof window === 'undefined' || !window.performance) {
    return {};
  }

  const metrics: PerformanceMetrics = {};

  // Navigation timing
  const navigationTiming = performance.getEntriesByType(
    'navigation'
  )[0] as PerformanceNavigationTiming;
  if (navigationTiming) {
    metrics.pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.startTime;
    metrics.ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
  }

  // Paint timing
  const _paintMetrics = performance.getEntriesByType('paint');
  for (const paint of _paintMetrics) {
    if (paint.name === 'first-contentful-paint') {
      metrics.fcp = paint.startTime;
    }
  }

  return metrics;
}

// Hook to use performance monitoring in components
export function usePerformanceMonitoring() {
  // Function to send metrics to analytics or logging service
  const sendMetrics = (metrics: PerformanceMetrics) => {
    // In a real app, you would send these metrics to your analytics service
    console.log('Performance metrics:', metrics);

    // Example: Send to a hypothetical analytics endpoint
    // fetch('/api/analytics/performance', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metrics)
    // })
  };

  // Function to measure component render time
  const measureRenderTime = (_componentName: string) => {
    const startTime = performance.now();

    return () => {
      const _endTime = performance.now();
      const _renderTime = _endTime - startTime;
      console.log(`${_componentName} render time: ${_renderTime.toFixed(2)}ms`);

      // You could also send this to your analytics service
    };
  };

  return { collectPerformanceMetrics, sendMetrics, measureRenderTime };
}
