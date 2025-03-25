import { Firestore } from "firebase/firestore";
import { Auth } from "firebase/auth";
import { Functions } from "firebase/functions";
import { FirebaseStorage } from "firebase/storage";
import { Messaging } from "firebase/messaging";
import { FirebaseApp } from "firebase/app";

// Global type declarations for Firebase
declare global {
  interface Window {
    firebase?: any;
  }
}

// Declare module augmentation for the Firebase lib exports
declare module "@/lib/firebase" {
  namespace FirebaseLib {
    const app: FirebaseApp | undefined;
    const auth: Auth | undefined;
    const db: Firestore | undefined;
    const storage: FirebaseStorage | undefined;
    const functions: Functions | undefined;
    const messaging: Messaging | null;
    const usingDummyImplementation: boolean;
  }
  
  export = FirebaseLib;
} 