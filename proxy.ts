import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth/middleware';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth/jwt';
import { parseCookies, serializeCookie, ACCESS_TOKEN_COOKIE_OPTIONS } from '@/lib/auth/cookies';

// Public paths that don't require authentication
const PUBLIC_PATHS = ['/auth/login', '/auth/setup'];

// API paths that don't require authentication
const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/setup',
  '/api/auth/check-setup',
  '/api/auth/csrf-token',
  '/api/auth/refresh',
];

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow public API paths
  if (PUBLIC_API_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check authentication for all other paths
  const user = getAuthUser(request);

  if (user) {
    // User is authenticated with valid access token
    return NextResponse.next();
  }

  // Access token invalid or missing - try refresh token
  const cookieHeader = request.headers.get('cookie');
  const cookies = parseCookies(cookieHeader);
  const refreshToken = cookies['refresh-token'];

  if (refreshToken) {
    const refreshPayload = verifyRefreshToken(refreshToken);
    
    if (refreshPayload) {
      // Generate new access token
      const newAccessToken = generateAccessToken(
        refreshPayload.userId,
        refreshPayload.username
      );

      const response = NextResponse.next();

      // Set new access token cookie
      response.headers.append(
        'Set-Cookie',
        serializeCookie('access-token', newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
      );

      return response;
    }
  }

  // No valid tokens - redirect or return 401
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.redirect(new URL('/auth/login', request.url));
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
