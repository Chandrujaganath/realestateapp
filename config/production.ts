export const _productionConfig = {
  // Firebase configuration for production environment
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
  },

  // API endpoints
  apiUrl: process.env.API_URL || 'https://api.realestate-app.com',

  // Feature flags for production
  features: {
    enableRealTimeUpdates: true,
    enablePushNotifications: true,
    enableQrCodeScanning: true,
    enableGeofencing: true,
    enableCctvIntegration: true,
  },

  // Logging configuration
  logging: {
    level: 'error', // Only log errors in production
    enableRemoteLogging: true,
  },

  // Performance monitoring
  performance: {
    enableMonitoring: true,
    sampleRate: 0.1, // Only monitor 10% of requests to reduce costs
  },
};
