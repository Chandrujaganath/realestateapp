"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { unsubscribe } from 'diagnostics_channel';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Add Plot type for import in CCTV pages
export interface Plot {
  id: string;
  projectId: string;
  projectName: string;
  number: string;
  location: string;
  area: number;
  price: number;
  status: "available" | "reserved" | "sold";
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  logOut: () => Promise<void>;
  getUserOwnedPlots: () => Promise<Plot[]>; // Add method to fetch user's plots
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    // Check if auth is defined before using it
    if (!auth) {
      setError("Authentication is not initialized");
      setLoading(false);
      return () => {};
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    try {
      if (!auth) {
        throw new Error("Authentication is not initialized");
      }
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Failed to sign in: " + (err instanceof Error ? err.message : String(err)));
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    setError(null);
    try {
      if (!auth) {
        throw new Error("Authentication is not initialized");
      }
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("Failed to create account: " + (err instanceof Error ? err.message : String(err)));
      throw err;
    }
  };

  const logOut = async () => {
    setError(null);
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (err) {
      setError("Failed to log out: " + (err instanceof Error ? err.message : String(err)));
      throw err;
    }
  };

  const getUserOwnedPlots = async (): Promise<Plot[]> => {
    try {
      if (!user || !db) {
        console.warn("User not authenticated or Firestore not initialized");
        return [];
      }
      
      // Query plots collection for plots owned by the current user
      const plotsRef = collection(db, 'plots');
      const q = query(plotsRef, where('ownerId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const plots: Plot[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        plots.push({
          id: doc.id,
          projectId: data.projectId,
          projectName: data.projectName,
          number: data.number,
          location: data.location,
          area: data.area,
          price: data.price,
          status: data.status,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      
      return plots;
    } catch (error) {
      console.error("Error fetching user plots:", error);
      return [];
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, logOut, getUserOwnedPlots }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
