import { setCookie, deleteCookie } from 'cookies-next';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
  UserCredential,
} from 'firebase/auth';
import { Auth } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, Firestore } from 'firebase/firestore';

import { User, UserRole, CreateUserPayload } from '@/features/users/types/user';
import { auth as _firebaseAuth, db } from '@/lib/firebase';
import { FirebaseService } from '@/services/firebase-service';

/**
 * Authentication service responsible for all auth-related operations
 */
export class AuthService extends FirebaseService {
  // Use the already initialized Firebase auth instance
  private auth: Auth | undefined = firebaseAuth;

  /**
   * Sign in a user with email and password
   */
  async signIn(email: string, password: string): Promise<UserCredential> {
    try {
      if (!this.auth) throw new Error('Auth not initialized');

      const result = await signInWithEmailAndPassword(this.auth, email, password);
      await this.setAuthTokenCookie(result.user);
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  /**
   * Sign up a new user
   */
  async signUp(payload: CreateUserPayload): Promise<UserCredential> {
    try {
      if (!this.auth) throw new Error('Auth not initialized');

      const { email, password, displayName, role } = payload;

      // Create Firebase auth user
      const result = await createUserWithEmailAndPassword(this.auth, email!, password!);
      const user = result.user;

      // Set token in cookie
      await this.setAuthTokenCookie(user);

      // Create user document in Firestore
      await this.createUserDocument(user, role, displayName);

      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      if (!this.auth) throw new Error('Auth not initialized');

      await signOut(this.auth);
      // Clear token cookies on logout
      deleteCookie('authToken');
      deleteCookie('userRole');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Create a user document in Firestore
   */
  private async createUserDocument(
    user: FirebaseUser,
    role: UserRole = 'client',
    displayName?: string
  ): Promise<void> {
    if (!db) throw new Error('Firestore not initialized');

    await setDoc(doc(db as Firestore, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName || user.displayName || user.email?.split('@')[0],
      role: role,
      accountStatus: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  }

  /**
   * Get the current user with additional data from Firestore
   */
  async getCurrentUser(): Promise<User | null> {
    if (!this.auth) throw new Error('Auth not initialized');
    if (!db) throw new Error('Firestore not initialized');

    const firebaseUser = this.auth.currentUser;

    if (!firebaseUser) {
      return null;
    }

    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db as Firestore, 'users', firebaseUser.uid));
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();

    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || userData.displayName,
      photoURL: firebaseUser.photoURL,
      phoneNumber: firebaseUser.phoneNumber,
      metadata: {
        creationTime: firebaseUser.metadata?.creationTime,
        lastSignInTime: firebaseUser.metadata?.lastSignInTime,
      },
      disabled: false,
      role: userData.role,
      accountStatus: userData.accountStatus || 'active',
      createdAt: this.timestampToDate(userData.createdAt) || new Date(),
      updatedAt: this.timestampToDate(userData.updatedAt) || new Date(),
    };

    return user;
  }

  /**
   * Set Firebase token in cookie
   */
  private async setAuthTokenCookie(firebaseUser: FirebaseUser): Promise<string | null> {
    try {
      if (!db) throw new Error('Firestore not initialized');

      const token = await firebaseUser.getIdToken();
      // Set token cookie - this will be used by the middleware
      setCookie('authToken', token, {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      // Get user role and set as cookie
      const userDoc = await getDoc(doc(db as Firestore, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCookie('userRole', userData.role, {
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
        });
      }

      return token;
    } catch (error) {
      console.error('Error setting auth token cookie:', error);
      return null;
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    if (!this.auth) {
      console.error('Auth not initialized');
      return () => {};
    }

    return onAuthStateChanged(this.auth, callback);
  }
}
