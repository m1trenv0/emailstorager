import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/csrf-token
 * Generate and return CSRF token for client
 */
export async function GET(request: NextRequest) {
  // Generate CSRF token
  const csrfToken = crypto.randomUUID();

  // Create response with CSRF token in header
  const response = NextResponse.json({ csrfToken });

  // Set CSRF token in cookie
  response.cookies.set({
    name: 'csrf-token',
    value: csrfToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return response;
}
