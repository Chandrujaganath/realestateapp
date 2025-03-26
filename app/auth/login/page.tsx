'use client';

import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { LoginForm } from '@/components/auth/login-form';
import { auth, db, isFirebaseInitialized } from '@/lib/firebase';
import { addFirebaseDebugger, diagnoseFirebaseIssues } from '@/lib/firebase-checker';
import { setCookie } from 'cookies-next';

type LoginError = {
  code: string;
  message: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<LoginError | null>(null);
  const [loading, setLoading] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);
  
  // Check if Firebase is initialized on component mount
  useEffect(() => {
    // Verify that Firebase auth is ready
    const checkFirebase = () => {
      if (isFirebaseInitialized() && auth) {
        setFirebaseReady(true);
        console.log('Firebase auth is ready to use');
      } else {
        setFirebaseReady(false);
        console.error('Firebase auth is not initialized');
        
        // Log diagnostic information
        const diagnostics = diagnoseFirebaseIssues();
        console.error('Firebase diagnostics:', diagnostics);
        
        setError({
          code: 'auth/not-initialized',
          message: 'Firebase auth not initialized. Please try again later.'
        });
      }
    };
    
    // Check immediately and also after a short delay to allow for async initialization
    checkFirebase();
    const timeout = setTimeout(checkFirebase, 1000);
    
    // Add the Firebase debugger in development mode
    if (process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        addFirebaseDebugger();
      }, 2000);
    }
    
    return () => clearTimeout(timeout);
  }, []);
  
  // For debugging - show current auth state when component loads
  useEffect(() => {
    // Check for existing cookies
    const authToken = document.cookie.includes('authToken');
    const userRole = document.cookie.includes('userRole');
    
    console.log('Login page loaded. Auth state:');
    console.log('- Auth token present:', authToken);
    console.log('- User role present:', userRole);
    console.log('- Firebase initialized:', isFirebaseInitialized());
    
    // If both cookies exist, attempt to redirect
    if (authToken && userRole) {
      console.log('Auth detected. User should be redirected by middleware.');
    }
  }, []);

  const getErrorMessage = (error: AuthError): LoginError => {
    console.log('Auth error code:', error.code);
    switch (error.code) {
      case 'auth/invalid-email':
        return {
          code: error.code,
          message: 'Invalid email address format.',
        };
      case 'auth/user-disabled':
        return {
          code: error.code,
          message: 'This account has been disabled. Please contact support.',
        };
      case 'auth/user-not-found':
        return {
          code: error.code,
          message: 'No account found with this email address.',
        };
      case 'auth/wrong-password':
        return {
          code: error.code,
          message: 'Incorrect password. Please try again.',
        };
      case 'auth/too-many-requests':
        return {
          code: error.code,
          message: 'Too many failed attempts. Please try again later.',
        };
      default:
        return {
          code: error.code,
          message: 'An error occurred during sign in. Please try again.',
        };
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Attempting login with:', email);
      
      // First check if Firebase is initialized
      if (!isFirebaseInitialized() || !auth) {
        throw new Error('Firebase auth not initialized');
      }
      
      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Login successful, user:', user.uid);

      // Get user token
      const token = await user.getIdToken();
      console.log('Token obtained, length:', token.length);

      // Set the auth token in a cookie
      setCookie('authToken', token, {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
        sameSite: 'strict',
      });
      console.log('Auth token cookie set');

      // Get user info from Firestore
      console.log('Fetching user document');
      if (!db) {
        throw new Error('Firestore database not initialized');
      }
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Ensure role is lowercase for consistency
        const role = userData.role?.toLowerCase();
        console.log('User role:', role);

        if (!role) {
          throw new Error('User role not found');
        }

        // Set role cookie for middleware
        setCookie('userRole', role, {
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
          sameSite: 'strict',
        });
        console.log('User role cookie set');

        console.log('Login successful, redirecting to dashboard for role:', role);

        // Small delay to ensure cookies are set before redirect
        setTimeout(() => {
          // Redirect based on role
          switch (role) {
            case 'admin':
              router.push('/dashboard/admin');
              break;
            case 'client':
              router.push('/dashboard/client');
              break;
            case 'manager':
              router.push('/dashboard/manager');
              break;
            case 'guest':
              router.push('/dashboard/guest');
              break;
            case 'superadmin':
              router.push('/dashboard/superadmin');
              break;
            default:
              router.push('/dashboard');
          }
        }, 500);
      } else {
        console.error('User document not found');
        setError({
          code: 'auth/user-not-found',
          message: 'User profile not found. Please contact support.',
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        if ('code' in err) {
          setError(getErrorMessage(err as AuthError));
        } else {
          setError({
            code: 'auth/unknown',
            message: err.message || 'An unexpected error occurred.',
          });
        }
      } else {
        setError({
          code: 'auth/unknown',
          message: 'An unexpected error occurred.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // For testing - option to manually clear cookies
  const clearAuthCookies = () => {
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    console.log('Auth cookies cleared');
  };
  
  // For testing - additional debugging for Firebase
  const retryFirebaseInit = () => {
    window.location.reload();
  };

  return (
    <div className="h-full bg-background">
      <LoginForm 
        onLoginSubmit={handleLogin} 
        isLoading={loading} 
        loginError={error?.message || null} 
        isFirebaseInitialized={firebaseReady}
      />
      {/* Hidden debug buttons - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-2 right-2 opacity-50">
          <button 
            onClick={clearAuthCookies}
            className="text-xs text-gray-500 p-1 border border-gray-300 rounded"
          >
            Clear Auth (Debug)
          </button>
          <button 
            onClick={retryFirebaseInit}
            className="text-xs text-gray-500 p-1 border border-gray-300 rounded ml-2"
          >
            Retry Firebase (Debug)
          </button>
        </div>
      )}
    </div>
  );
}
