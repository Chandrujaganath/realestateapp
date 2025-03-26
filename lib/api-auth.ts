// Create a utility function for API route authentication
import { NextRequest, NextResponse } from 'next/server';

import { adminAuth, usingDummyImplementation } from '@/lib/firebase-admin';

/**
 * Middleware helper for Firebase token authentication in API routes
 * @param req Next.js request object
 * @returns Object containing auth status and user ID if authenticated
 */
export async function authenticateRequest(_req: NextRequest) {
  // Handle development mode with dummy implementation
  if (usingDummyImplementation) {
    console.warn('[API-AUTH] Using dummy authentication in development mode');
    // Return dummy authenticated user for development
    if (process.env.NODE_ENV === 'development') {
      return {
        authenticated: true,
        userId: 'dummy-user-id',
        role: 'admin',
      };
    }
  }

  const _authHeader = _req.headers.get('Authorization');
  const idToken = _authHeader?.split('Bearer ')[1];

  if (!idToken) {
    console.warn('[API-AUTH] No Authorization token provided');
    return {
      authenticated: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return {
      authenticated: true,
      userId: decodedToken.uid,
      // Include other claims if needed
      role: decodedToken.claims?.role || 'user',
    };
  } catch (error) {
    console.error('[API-AUTH] Invalid token:', error);
    // Provide more details about potential Firebase configuration issues
    if (error instanceof Error && error.message.includes('credential')) {
      console.error(
        '[API-AUTH] This may be due to missing Firebase Admin credentials. Check FIREBASE_SERVICE_ACCOUNT_KEY in your environment variables.'
      );
    }
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          error: 'Unauthorized',
          details:
            process.env.NODE_ENV === 'development'
              ? error instanceof Error
                ? error.message
                : String(error)
              : undefined,
        },
        { status: 401 }
      ),
    };
  }
}
