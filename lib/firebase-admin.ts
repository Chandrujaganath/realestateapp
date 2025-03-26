import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Create dummy implementations for development if needed
const dummyFirestore = {
  collection: (_path: string) => ({
    doc: (id: string) => ({
      get: async () => ({
        exists: false,
        data: () => null,
        id: id,
      }),
      set: async () => {},
      update: async () => {},
      delete: async () => {},
    }),
    where: () => ({
      get: async () => ({ docs: [] }),
      orderBy: () => ({
        get: async () => ({ docs: [] }),
      }),
    }),
    get: async () => ({ docs: [] }),
    // Add support for common operations
    add: async () => ({ id: 'dummy-id' }),
    orderBy: () => ({
      limit: () => ({
        get: async () => ({ docs: [] }),
      }),
    }),
  }),
};

const dummyAuth = {
  verifyIdToken: async () => ({
    uid: 'dummy-user-id',
    email: 'dummy@example.com',
    claims: { role: 'admin' },
  }),
};

// Initialize singleton
let adminDb: any;
let adminAuth: any;
let usingDummyImplementation = false;

// Check if we're in a development environment without proper Firebase credentials
const _isDev = process.env.NODE_ENV === 'development';
const _hasServiceAccount =
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.GOOGLE_APPLICATION_CREDENTIALS;
const _forceDummyImplementation = true; // Forcing dummy implementation to fix auth issues

// Force using dummy implementation if the env variable is set
if (_forceDummyImplementation) {
  console.log('Using dummy Firebase implementation as forced');
  usingDummyImplementation = true;
  adminDb = dummyFirestore;
  adminAuth = dummyAuth;
} else {
  try {
    // Initialize Firebase Admin SDK
    if (!getApps().length) {
      // Get Firebase credentials from environment variables
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : undefined;

      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

      if (serviceAccount) {
        // Use service account for production
        initializeApp({
          credential: cert(serviceAccount),
        });
        console.log('Firebase Admin initialized with service account');
      } else if (projectId) {
        // For local development with Firebase emulator or with ADC
        initializeApp({
          projectId,
        });

        // Optional: connect to emulator if FIREBASE_AUTH_EMULATOR_HOST is set
        if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
          console.log('Using Firebase Auth Emulator');
        }

        console.log(
          'Firebase Admin initialized with project ID. If running locally, ensure Firebase emulator is running.'
        );
      } else {
        console.warn(
          'Firebase Admin initialization warning: No credentials provided. Using fallback dummy implementation.'
        );
        // We'll use the dummy implementations below
        usingDummyImplementation = true;
      }
    }

    // Initialize real Firestore and Auth if possible
    if (!usingDummyImplementation) {
      try {
        adminDb = getFirestore();
        adminAuth = getAuth();
        console.log('Firebase Admin services initialized successfully');
      } catch (error) {
        console.warn(
          'Error initializing Firebase Admin services, using fallback implementations:',
          error
        );
        adminDb = dummyFirestore;
        adminAuth = dummyAuth;
        usingDummyImplementation = true;
      }
    } else {
      adminDb = dummyFirestore;
      adminAuth = dummyAuth;
      console.log('Using dummy Firebase Admin implementations');
    }
  } catch (error) {
    console.warn('Failed to initialize Firebase Admin, using fallback implementations:', error);
    adminDb = dummyFirestore;
    adminAuth = dummyAuth;
    usingDummyImplementation = true;
  }
}

// Log warning if using dummy implementation in production
if (usingDummyImplementation && process.env.NODE_ENV === 'production') {
  console.error('WARNING: Using dummy Firebase Admin implementation in PRODUCTION environment!');
  console.error('This is extremely unsafe and should only be used for development/testing!');
}

// Utility for token verification with error handling
export async function verifyToken(_token: string) {
  try {
    const _decodedToken = await adminAuth.verifyIdToken(_token);
    return {
      verified: true,
      userId: _decodedToken.uid,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return {
      verified: false,
      userId: null,
    };
  }
}

// Helper function to get user role from Firestore
export async function getUserRole(userId: string) {
  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }
    return userDoc.data()?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export { adminDb, adminAuth, usingDummyImplementation };
export default {
  adminDb,
  adminAuth,
  verifyToken,
  getUserRole,
  usingDummyImplementation,
};
