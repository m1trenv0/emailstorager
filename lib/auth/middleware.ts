import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './jwt';
import { parseCookies } from './cookies';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    username: string;
  };
}

/**
 * Check if user is authenticated
 */
export function getAuthUser(request: NextRequest): {
  userId: string;
  username: string;
} | null {
  const cookieHeader = request.headers.get('cookie');
  const cookies = parseCookies(cookieHeader);
  const accessToken = cookies['access-token'];

  if (!accessToken) {
    return null;
  }

  const payload = verifyAccessToken(accessToken);
  if (!payload) {
    return null;
  }

  return {
    userId: payload.userId,
    username: payload.username,
  };
}

/**
 * Middleware to protect routes requiring authentication
 */
export function requireAuth(request: NextRequest): NextResponse | null {
  const user = getAuthUser(request);

  if (!user) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return null; // Continue with the request
}

/**
 * Middleware for API routes requiring authentication
 */
export function requireApiAuth(request: NextRequest): NextResponse | null {
  const user = getAuthUser(request);

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return null; // Continue with the request
}
