'use client';

// This file is a proxy to redirect imports from @/contexts/auth-context to hooks/use-auth-simple
// Updated to ensure consistent auth implementation across the app

import { AuthProvider, useAuth } from '@/hooks/use-auth-simple';

export { AuthProvider, useAuth };
