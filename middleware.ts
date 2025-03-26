import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Remove the import for now since it's not being used
// import { adminAuth, verifyToken } from '@/lib/firebase-admin';

// Define protected routes and their allowed roles (all lowercase)
const protectedRoutes: Record<string, string[]> = {
  '/dashboard/admin': ['admin', 'superadmin'],
  '/dashboard/manager': ['manager', 'admin', 'superadmin'],
  '/dashboard/client': ['client', 'admin', 'superadmin'],
  '/dashboard/guest': ['guest', 'admin', 'superadmin'],
  '/dashboard/superadmin': ['superadmin'],
  '/admin': ['admin', 'superadmin'],
  '/cctv/client': ['client', 'admin', 'superadmin'],
};

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if there's an auth token cookie
  const authToken = request.cookies.get('authToken')?.value;
  const userRole = request.cookies.get('userRole')?.value?.toLowerCase(); // Normalize role to lowercase

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

  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  // Add detailed logging
  console.log('=== Middleware Debug ===');
  console.log(`Path: ${pathname}`);
  console.log(`Auth Token: ${authToken ? 'Present' : 'Missing'}`);
  console.log(`Auth Token Length: ${authToken ? authToken.length : 0}`);
  console.log(`User Role: ${userRole || 'None'}`);
  console.log(`Is Protected Path: ${protectedPaths.some(path => pathname.startsWith(path)) ? 'Yes' : 'No'}`);
  
  // Debug cookies
  const allCookies = request.cookies.getAll();
  console.log('All cookies:', allCookies.map(c => `${c.name}=${c.value?.substring(0, 10)}...`).join(', '));

  // If trying to access login page with valid auth token, redirect to dashboard
  if (pathname === '/auth/login' && authToken && userRole) {
    console.log('Redirecting from login: User already authenticated');
    
    // Redirect based on normalized role
    switch (userRole) {
      case 'admin':
        return NextResponse.redirect(new URL('/dashboard/admin', request.url));
      case 'client':
        return NextResponse.redirect(new URL('/dashboard/client', request.url));
      case 'manager':
        return NextResponse.redirect(new URL('/dashboard/manager', request.url));
      case 'guest':
        return NextResponse.redirect(new URL('/dashboard/guest', request.url));
      case 'superadmin':
        return NextResponse.redirect(new URL('/dashboard/superadmin', request.url));
      default:
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Check if the current path matches any protected route patterns
  const matchingProtectedRoute = Object.entries(protectedRoutes).find(([route]) =>
    pathname.startsWith(route)
  );

  // If it's a protected route
  if (matchingProtectedRoute || protectedPaths.some(path => pathname.startsWith(path))) {
    console.log('Protected route detected');

    // If no auth token, redirect to login
    if (!authToken) {
      console.log('No auth token - redirecting to login');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // If no role, redirect to unauthorized
    if (!userRole) {
      console.log('No user role - redirecting to unauthorized');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // If it's a specific protected route, check role permissions
    if (matchingProtectedRoute) {
      const [route, allowedRoles] = matchingProtectedRoute;
      console.log(`Checking role permissions for ${route}`);
      console.log(`User role: ${userRole}`);
      console.log(`Allowed roles: ${allowedRoles.join(', ')}`);

      if (!allowedRoles.includes(userRole)) {
        console.log('Role not allowed - redirecting to unauthorized');
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
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
