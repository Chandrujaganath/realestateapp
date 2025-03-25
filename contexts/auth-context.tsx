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

  const getUserOwnedPlots = async () => {
    // Implementation of getUserOwnedPlots method
    // This is a placeholder and should be implemented based on your actual requirements
    return [];
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
