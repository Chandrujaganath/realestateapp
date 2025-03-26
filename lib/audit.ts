'use client';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';

// Types for audit logs
export interface AuditLog {
  action: string;
  performedBy: string;
  performedByRole: string;
  timestamp: any;
  entityType: string;
  entityId: string;
  details?: any;
  oldValue?: any;
  newValue?: any;
}

// Function to log actions to Firestore
export async function logAction(
  action: string,
  _userId: string,
  _userRole: string,
  entityType: string,
  entityId: string,
  details?: any,
  oldValue?: any,
  newValue?: any
) {
  try {
    const _logData: AuditLog = {
      action,
      performedBy: _userId,
      performedByRole: _userRole,
      timestamp: serverTimestamp(),
      entityType,
      entityId,
      details,
      oldValue,
      newValue,
    };

    if (!db) {
      console.error('Firestore database is not initialized');
      return;
    }

    await addDoc(collection(db, 'auditLogs'), _logData);
  } catch (error) {
    console.error('Failed to log action:', error);
    // Don't throw - logging should not break the main flow
  }
}

// Hook to use audit logging in components
export function useAuditLog() {
  const { user } = useAuth();

  const log = async (
    action: string,
    entityType: string,
    entityId: string,
    details?: any,
    oldValue?: any,
    newValue?: any
  ) => {
    if (!user) return;

    await logAction(
      action,
      user.uid,
      user.role || 'unknown', // Provide default value for role
      entityType,
      entityId,
      details,
      oldValue,
      newValue
    );
  };

  return { log };
}
