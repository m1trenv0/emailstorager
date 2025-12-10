import jwt from 'jsonwebtoken';

const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || 'default-access-secret';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';

const ACCESS_TOKEN_EXPIRY = '1h'; // 1 hour (extended for better UX)
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

export interface JWTPayload {
  userId: string;
  username: string;
  type: 'access' | 'refresh';
}

/**
 * Generate access token
 */
export function generateAccessToken(userId: string, username: string): string {
  const payload: JWTPayload = {
    userId,
    username,
    type: 'access',
  };

  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(userId: string, username: string): string {
  const payload: JWTPayload = {
    userId,
    username,
    type: 'refresh',
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as JWTPayload;
    if (decoded.type !== 'access') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
    if (decoded.type !== 'refresh') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}
