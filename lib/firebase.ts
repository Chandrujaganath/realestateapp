import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
import type { Messaging } from 'firebase/messaging';
import { getStorage, FirebaseStorage } from 'firebase/storage';
// Import getMessaging conditionally on client side

// Check if Firebase config is available client side
const isFirebaseConfigValid =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Only initialize if config is valid
const firebaseConfig = isFirebaseConfigValid
  ? {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    }
  : null;

// Initialize Firebase services
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let functions: Functions | undefined;
let messaging: Messaging | null = null;

try {
  // Initialize Firebase app
  if (firebaseConfig) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    functions = getFunctions(app);

    // Log success
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase config is not valid. Running in mock mode.');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Initialize messaging only on client side
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && app) {
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

export { app, auth, db, storage, functions, messaging };
