export const stagingConfig = {
  // Firebase configuration for staging environment
  firebase: {
    apiKey: process.env.STAGING_FIREBASE_API_KEY,
    authDomain: process.env.STAGING_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.STAGING_FIREBASE_PROJECT_ID,
    storageBucket: process.env.STAGING_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.STAGING_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.STAGING_FIREBASE_APP_ID,
    measurementId: process.env.STAGING_FIREBASE_MEASUREMENT_ID,
  },

  // API endpoints
  apiUrl: process.env.STAGING_API_URL || "https://staging-api.realestate-app.com",

  // Feature flags for staging
  features: {
    enableRealTimeUpdates: true,
    enablePushNotifications: true,
    enableQrCodeScanning: true,
    enableGeofencing: true,
    enableCctvIntegration: true,
  },

  // Logging configuration
  logging: {
    level: "debug",
    enableRemoteLogging: true,
  },

  // Performance monitoring
  performance: {
    enableMonitoring: true,
    sampleRate: 1.0, // 100% of requests are monitored
  },
}

