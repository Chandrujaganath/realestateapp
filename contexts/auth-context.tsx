'use client';

import { unsubscribe } from 'diagnostics_channel';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import React, { createContext, useContext, useState, useEffect } from 'react';

import { auth } from '@/lib/firebase';
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
  status: 'available' | 'reserved' | 'sold';
  createdAt: Date;
  updatedAt: Date;
}

interface VisitRequest {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  projectName: string;
  propertyType: string;
  requestDate: string;
  preferredDate: string;
  preferredTime: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  rejectionReason?: string;
}

interface AuthContextType {
  [x: string]: any;
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  logOut: () => Promise<void>;
  getUserOwnedPlots: () => Promise<Plot[]>;
  createProject: (projectData: any) => Promise<void>;
  getProjectTemplates: () => Promise<any[]>;
  getVisitRequests: () => Promise<VisitRequest[]>;
  approveVisitRequest: (id: string) => Promise<void>;
  rejectVisitRequest: (id: string, reason: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    // Check if auth is defined before using it
    if (!auth) {
      setError('Authentication is not initialized');
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
        throw new Error('Authentication is not initialized');
      }
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Failed to sign in: ' + (err instanceof Error ? err.message : String(err)));
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    setError(null);
    try {
      if (!auth) {
        throw new Error('Authentication is not initialized');
      }
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Failed to create account: ' + (err instanceof Error ? err.message : String(err)));
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
      setError('Failed to log out: ' + (err instanceof Error ? err.message : String(err)));
      throw err;
    }
  };

  const getUserOwnedPlots = async (): Promise<Plot[]> => {
    try {
      if (!user || !db) {
        console.warn('User not authenticated or Firestore not initialized');
        return [];
      }

      // Query plots collection for plots owned by the current user
      const _plotsRef = collection(db, 'plots');
      const _q = query(_plotsRef, where('ownerId', '==', user.uid));
      const querySnapshot = await getDocs(_q);

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
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      return plots;
    } catch (error) {
      console.error('Error fetching user plots:', error);
      return [];
    }
  };

  const createProject = async (projectData: any) => {
    try {
      if (!user || !db) {
        throw new Error('User not authenticated or Firestore not initialized');
      }

      const _projectsRef = collection(db, 'projects');
      const _projectWithMetadata = {
        ...projectData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
      };

      await addDoc(_projectsRef, _projectWithMetadata);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const getProjectTemplates = async () => {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const _templatesRef = collection(db, 'projectTemplates');
      const querySnapshot = await getDocs(_templatesRef);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching project templates:', error);
      return [];
    }
  };

  const getVisitRequests = async (): Promise<VisitRequest[]> => {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const _requestsRef = collection(db, 'visitRequests');
      const querySnapshot = await getDocs(_requestsRef);

      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VisitRequest[];
    } catch (error) {
      console.error('Error fetching visit requests:', error);
      return [];
    }
  };

  const approveVisitRequest = async (id: string) => {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const requestRef = doc(db, 'visitRequests', id);
      await updateDoc(requestRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error approving visit request:', error);
      throw error;
    }
  };

  const rejectVisitRequest = async (id: string, reason: string) => {
    try {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const requestRef = doc(db, 'visitRequests', id);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error rejecting visit request:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signIn,
        signUp,
        logOut,
        getUserOwnedPlots,
        createProject,
        getProjectTemplates,
        getVisitRequests,
        approveVisitRequest,
        rejectVisitRequest,
      }}
    >
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
