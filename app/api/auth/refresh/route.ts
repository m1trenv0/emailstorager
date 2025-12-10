import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateAccessToken } from '@/lib/auth/jwt';
import {
  parseCookies,
  serializeCookie,
  ACCESS_TOKEN_COOKIE_OPTIONS,
} from '@/lib/auth/cookies';

/**
 * POST /api/auth/refresh
 * Refresh the access token using the refresh token
 */
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    const refreshToken = cookies['refresh-token'];

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(
      payload.userId,
      payload.username
    );

    // Create response with new access token cookie
    const response = NextResponse.json({ success: true }, { status: 200 });

    response.headers.append(
      'Set-Cookie',
      serializeCookie(
        'access-token',
        newAccessToken,
        ACCESS_TOKEN_COOKIE_OPTIONS
      )
    );

    return response;
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
