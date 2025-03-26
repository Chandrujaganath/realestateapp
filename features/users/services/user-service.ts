import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';

import { User } from '@/features/users/types/user';
import { db } from '@/lib/firebase';
import { FirebaseService } from '@/services/firebase-service';

export class UserService extends FirebaseService {
  private readonly collectionName = 'users';

  /**
   * Get all users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      if (!db) {
        throw new Error('Firestore database is not initialized');
      }
      const usersRef = collection(db, this.collectionName);
      const q = query(usersRef, orderBy('displayName', 'asc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => this.mapDocToUser(doc));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Failed to get users');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      if (!db) {
        throw new Error('Firestore database is not initialized');
      }
      const userDoc = await getDoc(doc(db, this.collectionName, id));

      if (!userDoc.exists()) {
        return null;
      }

      return this.mapDocToUser(userDoc);
    } catch (error) {
      console.error(`Error getting user with id ${id}:`, error);
      throw new Error('Failed to get user');
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<User[]> {
    try {
      if (!db) {
        throw new Error('Firestore database is not initialized');
      }
      const usersRef = collection(db, this.collectionName);
      const q = query(usersRef, where('role', '==', role), orderBy('displayName', 'asc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map((doc) => this.mapDocToUser(doc));
    } catch (error) {
      console.error(`Error getting users with role ${role}:`, error);
      throw new Error('Failed to get users by role');
    }
  }

  /**
   * Helper to map Firestore doc to User
   */
  private mapDocToUser(doc: any): User {
    const data = doc.data();

    return {
      id: doc.id,
      email: data.email,
      displayName: data.displayName || null,
      role: data.role || 'user',
      phoneNumber: data.phoneNumber || null,
      photoURL: data.photoURL || null,
      createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      metadata: data.metadata || {},
      disabled: data.disabled || false,
      updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
    };
  }
}
