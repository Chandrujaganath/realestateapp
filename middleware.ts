import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { _adminAuth, _verifyToken } from '@/lib/firebase-admin';

// Define protected routes and their allowed roles
const protectedRoutes: Record<string, string[]> = {
  '/dashboard/admin': ['admin', 'superadmin'],
  '/dashboard/manager': ['manager', 'admin', 'superadmin'],
  '/dashboard/client': ['client', 'admin', 'superadmin'],
  '/dashboard/guest': ['guest', 'admin', 'superadmin'],
  '/dashboard/superadmin': ['superadmin', 'SuperAdmin'],
  '/admin': ['admin', 'superadmin'],
  '/cctv/client': ['client', 'admin', 'superadmin'],
};

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if there's an auth token cookie
  const authToken = request.cookies.get('authToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  // Protected routes that require authentication
  const protectedPaths = [
    '/dashboard',
    '/admin',
    '/plot',
    '/project',
    '/tasks',
    '/cctv/client',
    '/visit',
  ];

  // Admin-only routes
  const adminPaths = ['/admin', '/dashboard/admin'];

  // SuperAdmin-only routes
  const superAdminPaths = ['/dashboard/superadmin'];

  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  // Add logging for debugging
  console.log(`Middleware processing path: ${pathname}`);
  console.log(`Auth token present: ${!!authToken}`);
  console.log(`User role from cookie: ${userRole || 'None'}`);

  // If trying to access login page with valid auth token, redirect to dashboard
  if (pathname === '/auth/login' && authToken && userRole) {
    console.log('User already logged in, redirecting to dashboard');
    
    // Redirect based on role
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/dashboard/admin', request.url));
    } else if (userRole === 'client') {
      return NextResponse.redirect(new URL('/dashboard/client', request.url));
    } else if (userRole === 'manager') {
      return NextResponse.redirect(new URL('/dashboard/manager', request.url));
    } else if (userRole === 'guest') {
      return NextResponse.redirect(new URL('/dashboard/guest', request.url));
    } else if (userRole.toLowerCase() === 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard/superadmin', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Check if it's a protected route
  const isProtectedRoute = protectedPaths.some((path) => pathname.startsWith(path));

  // Check if it's an admin route
  const isAdminRoute = adminPaths.some((path) => pathname.startsWith(path));

  // Check if it's a superadmin route
  const isSuperAdminRoute = superAdminPaths.some((path) => pathname.startsWith(path));

  // If it's a protected route and there's no auth token, redirect to login
  if (isProtectedRoute && !authToken) {
    console.log('Redirecting to login: No auth token for protected route');
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If it's an admin route and the user is not an admin, redirect to unauthorized
  if (isAdminRoute && userRole && !['admin', 'superadmin'].includes(userRole.toLowerCase())) {
    console.log(`Redirecting to unauthorized: User role (${userRole}) not allowed for admin route`);
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // If it's a superadmin route, perform a case-insensitive check for superadmin role
  if (isSuperAdminRoute && userRole) {
    const normalizedRole = userRole.toLowerCase();
    console.log(`SuperAdmin route check: User role=${userRole}, normalized=${normalizedRole}`);

    if (normalizedRole !== 'superadmin') {
      console.log(
        `Redirecting to unauthorized: User role (${userRole}) not allowed for superadmin route`
      );
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    } else {
      console.log('SuperAdmin route access granted');
    }
  }

  // Continue with the request if all checks pass
  console.log('Middleware check passed');
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
