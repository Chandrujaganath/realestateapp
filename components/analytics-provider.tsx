'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { createContext, useContext, useEffect, type ReactNode } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { useAnalytics } from '@/lib/analytics';

// Create context
const AnalyticsContext = createContext<ReturnType<typeof useAnalytics> | undefined>(undefined);

// Provider component
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const analytics = useAnalytics(user?.uid);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views
  useEffect(() => {
    if (pathname) {
      // Get page name from pathname
      const _pageName = pathname.split('/').filter(Boolean).join('/');
      analytics.trackPageView(pageName || 'home');
    }
  }, [pathname, analytics]);

  // Track search params changes (for UTM tracking, etc.)
  useEffect(() => {
    if (searchParams && searchParams.toString()) {
      const _params = Object.fromEntries(searchParams.entries());
      analytics.track('url_params_change', params);
    }
  }, [searchParams, analytics]);

  return <AnalyticsContext.Provider value={analytics}>{children}</AnalyticsContext.Provider>;
}

// Hook to use analytics in components
export function usePageAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('usePageAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}
