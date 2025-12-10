import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { validatePasswordStrength } from '@/lib/auth/password';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt';
import {
  serializeCookie,
  ACCESS_TOKEN_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE_OPTIONS,
} from '@/lib/auth/cookies';
import { setupSchema } from '@/lib/auth/validation';
import { createDefaultAliExpressService } from '@/lib/setup/createDefaultService';
import { csrfProtection, rateLimit } from '@/lib/middleware';

/**
 * POST /api/auth/setup
 * Create the first user account
 */
export async function POST(request: NextRequest) {
  try {
    // Apply CSRF protection
    const csrfResult = csrfProtection(request);
    if (csrfResult) return csrfResult;

    // Apply rate limiting
    const rateLimitResult = rateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    // Check if a user already exists
    const existingUser = await prisma.user.findFirst();
    if (existingUser) {
      return NextResponse.json(
        {
          error:
            'User already exists. Setup is only available for first-time setup.',
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = setupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.issues },
        { status: 400 }
      );
    }

    const { username, password } = result.data;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: 'Password does not meet requirements',
          details: passwordValidation.errors,
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    // Create default AliExpress service for new user
    try {
      await createDefaultAliExpressService(prisma);
      console.log('Default AliExpress service created for new user');
    } catch (serviceError) {
      console.error('Failed to create default service:', serviceError);
      // Continue with user creation even if service creation fails
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.username);
    const refreshToken = generateRefreshToken(user.id, user.username);

    // Create response with cookies
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          username: user.username,
        },
      },
      { status: 201 }
    );

    // Set cookies
    response.headers.append(
      'Set-Cookie',
      serializeCookie('access-token', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS)
    );
    response.headers.append(
      'Set-Cookie',
      serializeCookie(
        'refresh-token',
        refreshToken,
        REFRESH_TOKEN_COOKIE_OPTIONS
      )
    );

    return response;
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
