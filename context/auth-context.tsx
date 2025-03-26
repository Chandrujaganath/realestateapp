'use client';

// This file is a proxy to redirect imports from @/context/auth-context to hooks/use-auth
// Created to fix build errors without changing all import paths

import { AuthProvider, useAuth } from '@/hooks/use-auth';

export { AuthProvider, useAuth };
