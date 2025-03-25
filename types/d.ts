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
  export const app: FirebaseApp | undefined;
  export const auth: Auth | undefined;
  export const db: Firestore | undefined;
  export const storage: FirebaseStorage | undefined;
  export const functions: Functions | undefined;
  export const messaging: Messaging | null;
  export const usingDummyImplementation: boolean;
} 