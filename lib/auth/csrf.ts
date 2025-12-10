import { serialize } from 'cookie';

// CSRF Token utilities
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

export function createCSRFCookie(token: string): string {
  return serialize('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export function createCSRFHeader(token: string): Record<string, string> {
  return {
    'x-csrf-token': token,
  };
}
