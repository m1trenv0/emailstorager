import { NextRequest, NextResponse } from 'next/server';
import { z, ZodIssue } from 'zod';

// CSRF Protection Middleware
export function csrfProtection(request: NextRequest) {
  const csrfToken = request.headers.get('x-csrf-token');
  const sessionToken = request.cookies.get('csrf-token')?.value;

  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }

  return null; // Valid
}

// Input Validation Schemas
export const createAccountSchema = z.object({
  primaryEmail: z.string().email(),
  recoveryEmail: z.string().email(),
  recoveryPassword: z.string().min(1),
});

export const createAliasSchema = z.object({
  accountId: z.string(),
  email: z.string().email(),
  comments: z.string().optional(),
});

export const updateAliasSchema = z.object({
  status: z.object({
    aliexpress: z.object({
      isRegistered: z.boolean(),
      isBanned: z.boolean(),
    }),
    augment: z.object({
      isRegistered: z.boolean(),
      isBanned: z.boolean(),
    }),
  }),
  comments: z.string().optional(),
});

// Validation Middleware
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map((e: ZodIssue) => e.message).join(', '),
    };
  }
  return { success: true, data: result.data };
}

// Rate Limiting (simple in-memory for demo)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  request: NextRequest,
  maxRequests = 100,
  windowMs = 15 * 60 * 1000
) {
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const now = Date.now();
  const windowStart = now - windowMs;

  const current = rateLimitMap.get(ip);
  if (!current || current.resetTime < windowStart) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return null;
  }

  if (current.count >= maxRequests) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  current.count++;
  return null;
}
