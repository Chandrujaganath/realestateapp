// Simple analytics tracking utility

// Interface for event data
export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  userId?: string;
}

// Function to track events
export function trackEvent(_event: AnalyticsEvent) {
  if (typeof window === 'undefined') {
    return;
  }

  // In a real app, you would send this to your analytics service
  console.log('Analytics event:', event);

  // Example: Send to a hypothetical analytics endpoint
  // fetch('/api/analytics/events', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(event)
  // })
}

// Hook to use analytics in components
export function useAnalytics(userId?: string) {
  const track = (eventName: string, properties?: Record<string, any>) => {
    trackEvent({
      eventName,
      properties,
      userId,
    });
  };

  // Common events
  const trackPageView = (pageName: string) => {
    track('page_view', { pageName });
  };

  const trackButtonClick = (buttonName: string, additionalProps?: Record<string, any>) => {
    track('button_click', { buttonName, ...additionalProps });
  };

  const trackFormSubmit = (
    formName: string,
    success: boolean,
    additionalProps?: Record<string, any>
  ) => {
    track('form_submit', { formName, success, ...additionalProps });
  };

  return { track, trackPageView, trackButtonClick, trackFormSubmit };
}
