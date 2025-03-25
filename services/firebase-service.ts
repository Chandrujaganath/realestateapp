import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  DocumentData,
  QueryConstraint,
  serverTimestamp, 
  Timestamp,
  DocumentReference,
  CollectionReference,
  addDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Base Firebase service that provides common Firestore operations
 */
export class FirebaseService {
  protected db = getFirestore();
  
  /**
   * Get a collection reference
   */
  protected getCollection<T = DocumentData>(collectionPath: string): CollectionReference<T> {
    return collection(this.db, collectionPath) as CollectionReference<T>;
  }
  
  /**
   * Get a document reference
   */
  protected getDocRef<T = DocumentData>(collectionPath: string, docId: string): DocumentReference<T> {
    return doc(this.db, collectionPath, docId) as DocumentReference<T>;
  }
  
  /**
   * Create a document with a given ID
   */
  protected async createDoc<T extends DocumentData>(
    collectionPath: string, 
    docId: string, 
    data: T
  ): Promise<void> {
    const docRef = this.getDocRef(collectionPath, docId);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  
  /**
   * Create a document with an auto-generated ID
   */
  protected async addDoc<T extends DocumentData>(
    collectionPath: string, 
    data: T
  ): Promise<string> {
    const colRef = this.getCollection(collectionPath);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }
  
  /**
   * Update a document
   */
  protected async updateDoc<T extends Partial<DocumentData>>(
    collectionPath: string, 
    docId: string, 
    data: T
  ): Promise<void> {
    const docRef = this.getDocRef(collectionPath, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }
  
  /**
   * Delete a document
   */
  protected async deleteDoc(
    collectionPath: string, 
    docId: string
  ): Promise<void> {
    const docRef = this.getDocRef(collectionPath, docId);
    await deleteDoc(docRef);
  }
  
  /**
   * Get a document by ID
   */
  protected async getDocById<T>(
    collectionPath: string, 
    docId: string
  ): Promise<T | null> {
    const docRef = this.getDocRef<T>(collectionPath, docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return { id: docSnap.id, ...docSnap.data() } as T & { id: string };
  }
  
  /**
   * Query documents with constraints
   */
  protected async queryDocs<T>(
    collectionPath: string, 
    constraints: QueryConstraint[] = []
  ): Promise<Array<T & { id: string }>> {
    const colRef = this.getCollection<T>(collectionPath);
    const q = query(colRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as T & { id: string };
    });
  }
  
  /**
   * Get all documents from a collection
   */
  protected async getAllDocs<T>(
    collectionPath: string,
    orderByField?: string,
    orderDirection?: 'asc' | 'desc'
  ): Promise<Array<T & { id: string }>> {
    const constraints: QueryConstraint[] = [];
    
    if (orderByField) {
      constraints.push(orderBy(orderByField, orderDirection || 'asc'));
    }
    
    return this.queryDocs<T>(collectionPath, constraints);
  }
  
  /**
   * Convert a Firestore timestamp to a JavaScript Date
   */
  protected timestampToDate(timestamp: Timestamp | null | undefined): Date | null {
    if (!timestamp) return null;
    return timestamp.toDate();
  }
  
  /**
   * Normalize Firestore data by converting timestamps to dates
   */
  protected normalizeData<T extends DocumentData>(data: T): T {
    const normalized = { ...data };
    
    Object.keys(normalized).forEach(key => {
      const value = normalized[key];
      
      if (value instanceof Timestamp) {
        normalized[key] = this.timestampToDate(value);
      } else if (value && typeof value === 'object' && !(value instanceof Date)) {
        normalized[key] = this.normalizeData(value);
      }
    });
    
    return normalized;
  }
} 