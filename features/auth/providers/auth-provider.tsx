'use client';

import { useRouter } from 'next/navigation';
import React, { createContext, useEffect, useState, useContext } from 'react';

import { AuthService } from '@/features/auth/services/auth-service';
import { User } from '@/features/users/types/user';
import { CreateUserPayload } from '@/features/users/types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: CreateUserPayload) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const _router = useRouter();
  const authService = new AuthService();

  useEffect(() => {
    // Subscribe to auth state changes
    const _unsubscribe = authService.onAuthStateChanged(async (_firebaseUser) => {
      setLoading(true);
      try {
        if (_firebaseUser) {
          // User is signed in; fetch full user profile
          const _fullUser = await authService.getCurrentUser();
          setUser(_fullUser);
        } else {
          // User is signed out
          setUser(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
        setError('Authentication error');
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => _unsubscribe();
  }, [authService]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authService.signIn(email, password);
      setError(null);
      // onAuthStateChanged will update the user state
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (payload: CreateUserPayload) => {
    setLoading(true);
    try {
      await authService.signUp(payload);
      setError(null);
      // onAuthStateChanged will update the user state
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setError(null);
      // onAuthStateChanged will update the user state
      _router.push('/auth/login');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const _contextValue: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={_contextValue}>{children}</AuthContext.Provider>;
};

export const _useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
