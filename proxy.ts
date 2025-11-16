import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';

// Public paths that don't require authentication
const publicPaths = ['/auth/login', '/auth/setup'];

// API paths that don't require authentication
const publicApiPaths = ['/api/auth/login', '/api/auth/setup', '/api/auth/check-setup'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow public API paths
  if (publicApiPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if users exist in database
  try {
    const userCount = await prisma.user.count();

    if (userCount === 0) {
      // No users exist, redirect to setup
      if (!pathname.startsWith('/auth/setup')) {
        return NextResponse.redirect(new URL('/auth/setup', request.url));
      }
      return NextResponse.next();
    }
  } catch (error) {
    console.error('Proxy: Failed to check user count:', error);
    // On error, continue to auth check
  }

  // Check authentication for all other paths
  const user = getAuthUser(request);

  if (!user) {
    // Not authenticated
    if (pathname.startsWith('/api/')) {
      // API routes return 401
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } else {
      // Web routes redirect to login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // User is authenticated, allow access
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)',
  ],
};
