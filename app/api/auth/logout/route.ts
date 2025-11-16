import { NextRequest, NextResponse } from 'next/server';
import { createClearCookie } from '@/lib/auth/cookies';

/**
 * POST /api/auth/logout
 * Clear authentication cookies
 */
export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    // Clear cookies
    response.headers.append('Set-Cookie', createClearCookie('access-token'));
    response.headers.append('Set-Cookie', createClearCookie('refresh-token'));

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
