'use client';

import { useContext } from 'react';

import AuthContext from '@/features/auth/providers/auth-provider';

/**
 * Hook to access authentication context throughout the application
 * This hook should be used within components that are children of AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
