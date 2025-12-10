import { serialize, parse, type SerializeOptions } from 'cookie';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Cookie configuration for access token
 */
export const ACCESS_TOKEN_COOKIE_OPTIONS: SerializeOptions = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: 'strict',
  maxAge: 60 * 60, // 1 hour in seconds (extended for better UX)
  path: '/',
};

/**
 * Cookie configuration for refresh token
 */
export const REFRESH_TOKEN_COOKIE_OPTIONS: SerializeOptions = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  path: '/',
};

/**
 * Serialize a cookie
 */
export function serializeCookie(
  name: string,
  value: string,
  options: SerializeOptions
): string {
  return serialize(name, value, options);
}

/**
 * Parse cookies from a request header
 */
export function parseCookies(
  cookieHeader: string | null
): Record<string, string> {
  if (!cookieHeader) return {};
  return parse(cookieHeader) as Record<string, string>;
}

/**
 * Create a cookie to delete/clear an existing cookie
 */
export function createClearCookie(name: string): string {
  return serialize(name, '', {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}
