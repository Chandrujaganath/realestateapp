import { productionConfig } from './production';
import { stagingConfig } from './staging';

// Determine the environment
const _environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';

// Load the appropriate configuration
export const _config = (() => {
  switch (environment) {
    case 'production':
      return productionConfig;
    case 'staging':
      return stagingConfig;
    default:
      // Development configuration (could be imported from a separate file)
      return {
        // Firebase configuration for development environment
        firebase: {
          apiKey: process.env.DEV_FIREBASE_API_KEY,
          authDomain: process.env.DEV_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.DEV_FIREBASE_PROJECT_ID,
          storageBucket: process.env.DEV_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.DEV_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.DEV_FIREBASE_APP_ID,
          measurementId: process.env.DEV_FIREBASE_MEASUREMENT_ID,
        },

        // API endpoints
        apiUrl: process.env.DEV_API_URL || 'http://localhost:3000/api',

        // Feature flags for development
        features: {
          enableRealTimeUpdates: true,
          enablePushNotifications: true,
          enableQrCodeScanning: true,
          enableGeofencing: true,
          enableCctvIntegration: true,
        },

        // Logging configuration
        logging: {
          level: 'debug',
          enableRemoteLogging: false, // Log locally in development
        },

        // Performance monitoring
        performance: {
          enableMonitoring: false, // Disable in development
          sampleRate: 1.0,
        },
      };
  }
})();

// Export individual configuration sections for convenience
export const { firebase, apiUrl, features, logging, performance } = config;
