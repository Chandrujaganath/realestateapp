import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
import type { Messaging } from 'firebase/messaging';
import { getStorage, FirebaseStorage } from 'firebase/storage';
// Import getMessaging conditionally on client side

// Try to load environment variables manually if on server
if (typeof window === 'undefined') {
  try {
    // Only run on server side
    const { loadEnvFromFile } = require('./load-env');
    loadEnvFromFile();
  } catch (error) {
    console.error('Failed to load environment variables manually:', error);
  }
}

// Add debugging for environment variables
const debugEnv = () => {
  if (process.env.NODE_ENV !== 'production') {
    const firebaseEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID',
    ];
    
    const envStatus = firebaseEnvVars.map(varName => {
      const exists = !!process.env[varName];
      const value = exists ? `${process.env[varName]?.substring(0, 5)}...` : 'undefined';
      return `${varName}: ${exists ? '✅' : '❌'} ${value}`;
    });
    
    console.log('Environment Variables Status:');
    console.log(envStatus.join('\n'));
  }
};

// Debug environment variables
debugEnv();

// Check if Firebase config is available client side
const isFirebaseConfigValid =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Create Firebase config object
const createFirebaseConfig = () => {
  // Use hard-coded config for development if env vars are missing
  if (process.env.NODE_ENV === 'development' && !isFirebaseConfigValid) {
    console.warn('Using hard-coded Firebase config for development');
    return {
      apiKey: "AIzaSyC0cpqQ2ifoUXFh9CQd8fQSRE0PdV601to",
      authDomain: "plotapp-a9f52.firebaseapp.com",
      projectId: "plotapp-a9f52",
      storageBucket: "plotapp-a9f52.firebasestorage.app",
      messagingSenderId: "64567152996",
      appId: "1:64567152996:web:521e34fcf805acf97aea71",
      measurementId: "G-LJBPZYD610",
    };
  }
  
  // Use environment variables if available
  if (isFirebaseConfigValid) {
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };
  }
  
  // If nothing else, return undefined
  return undefined;
};

// Get the Firebase config
const firebaseConfig = createFirebaseConfig();

console.log('Firebase config valid:', !!firebaseConfig);

// Initialize Firebase app immediately to ensure it's ready
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;
let messaging: Messaging | null = null;
let firebaseInitialized = false;

// Try to initialize Firebase
try {
  // Only initialize if we have a valid config
  if (!firebaseConfig) {
    console.error('Firebase configuration is missing or invalid. Check your environment variables.');
    throw new Error('Firebase configuration is invalid');
  }

  // Initialize Firebase or get existing app
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
  } else {
    app = getApp();
    console.log('Using existing Firebase app');
  }

  // Initialize all Firebase services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);
  
  // Mark initialization as successful
  firebaseInitialized = true;
  console.log('All Firebase services initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // In case of error, we need to set up fallbacks to prevent runtime errors
  if (typeof window !== 'undefined') {
    // Show an error notification in development, but not in production
    if (process.env.NODE_ENV !== 'production') {
      console.error('Firebase failed to initialize - application may not work correctly');
    }
  }
}

// Initialize messaging only on client side
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && firebaseInitialized) {
  const loadMessaging = async () => {
    try {
      // Dynamically import to avoid SSR issues
      const { getMessaging } = await import('firebase/messaging');
      messaging = getMessaging(app);
      console.log('Firebase messaging initialized');
    } catch (error) {
      console.error('Firebase messaging initialization error:', error);
      // Set messaging to null to indicate it's not available
      messaging = null;
    }
  };

  // Don't block the main thread, initialize messaging asynchronously
  if (document.readyState === 'complete') {
    loadMessaging();
  } else {
    window.addEventListener('load', () => {
      loadMessaging();
    });
  }
}

// Check if Firebase is initialized
const isFirebaseInitialized = () => firebaseInitialized;

// Export initialized services
export { app, auth, db, storage, functions, messaging, isFirebaseInitialized };
