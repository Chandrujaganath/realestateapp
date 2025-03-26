'use client';

// This file is a proxy to redirect imports from @/hooks/use-auth to hooks/use-auth-simple
// We're standardizing on the simple implementation to ensure consistency

import { AuthProvider, useAuth } from './use-auth-simple';

export { AuthProvider, useAuth }; 