'use client';

// This file is a proxy to redirect imports from @/context/auth-context to @/contexts/auth-context
// Created to fix build errors without changing all import paths

import { AuthProvider, useAuth } from '@/contexts/auth-context';

export { AuthProvider, useAuth };
