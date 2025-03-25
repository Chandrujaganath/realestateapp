# Auth System Migration Guide

This guide explains how to migrate from the old auth system in `/features/auth` to the new centralized auth system in `/hooks/use-auth.tsx`.

## Background

The application had two separate auth implementations:

1. `/hooks/use-auth.tsx` - Primary implementation with AuthProvider and useAuth hook
2. `/features/auth/hooks/use-auth.ts` and `/features/auth/providers/auth-provider.tsx` - Secondary implementation

This caused conflicts when both were used in different parts of the application.

## Migration Steps

1. Replace all imports of the old auth system with the new one:

   ```diff
   - import { useAuth } from "@/features/auth/hooks/use-auth";
   + import { useAuth } from "@/hooks/use-auth";
   ```

   ```diff
   - import { AuthProvider } from "@/features/auth/providers/auth-provider";
   + import { AuthProvider } from "@/hooks/use-auth";
   ```

2. Files that were updated:
   - `features/tasks/hooks/use-tasks.ts`
   - `features/tasks/components/task-card.tsx`
   - `app/(dashboard)/projects/page.tsx`
   - `components/client-auth-wrapper.tsx`
   - `components/common/navigation/bottom-nav.tsx`

## Future Considerations

Once all components have been migrated to the new auth system, you should consider:

1. Remove the old auth implementation files:
   - `/features/auth/hooks/use-auth.ts`
   - `/features/auth/providers/auth-provider.tsx`

2. If you need to maintain the auth service functionality from `/features/auth/services/auth-service.ts`, consider moving it to `/services/auth-service.ts` or into the main `/hooks/use-auth.tsx` file.

## Best Practices

- Use only one authentication system throughout the application
- Ensure all components requiring auth are wrapped with the same `AuthProvider`
- Structure your app's directory to prevent duplicate implementations of core functionalities 