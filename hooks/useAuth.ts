// This file is a proxy to redirect imports from @/hooks/useAuth to hooks/use-auth-simple
// Created to ensure backwards compatibility and consistent auth implementation

import { useAuth as _useAuthSimple } from './use-auth-simple';

export const useAuth = _useAuthSimple;

// We're using the simple version for consistency
export default useAuth;
