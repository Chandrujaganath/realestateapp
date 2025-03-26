import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { Functions } from 'firebase/functions';
import { Messaging } from 'firebase/messaging';
import { FirebaseStorage } from 'firebase/storage';

// Global type declarations for Firebase
declare global {
  interface Window {
    firebase?: any;
  }
}

// Declare module augmentation for the Firebase lib exports
declare module '@/lib/firebase' {
  namespace FirebaseLib {
    interface Exports {
      app: FirebaseApp | undefined;
      auth: Auth | undefined;
      db: Firestore | undefined;
      storage: FirebaseStorage | undefined;
      functions: Functions | undefined;
      messaging: Messaging | null;
      usingDummyImplementation: boolean;
    }
  }
}
