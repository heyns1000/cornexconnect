import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { nanoid } from 'nanoid';

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-this';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface DecodedToken {
  sub: string; // user id
  email: string;
  roles: string[];
  iat: number;
  exp: number;
  jti?: string; // JWT ID for token revocation
}

export interface RefreshTokenPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  jti: string; // JWT ID for rotation
}

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Promise<string> Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  
  // Check password complexity
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    throw new Error(
      'Password must contain uppercase, lowercase, numbers, and special characters'
    );
  }

  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against its hash
 * @param password Plain text password
 * @param hash Hashed password
 * @returns Promise<boolean>
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 * @param userId User ID
 * @param email User email
 * @param roles User roles
 * @param jti Token ID for revocation
 * @returns string JWT token
 */
export function generateAccessToken(
  userId: string,
  email: string,
  roles: string[] = ['user'],
  jti?: string
): string {
  const payload: DecodedToken = {
    sub: userId,
    email,
    roles,
    iat: Math.floor(Date.now() / 1000),
    exp: 0, // Will be set by jwt.sign
    jti: jti || nanoid(),
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    issuer: 'cornexconnect',
    audience: 'cornexconnect-api',
  });
}

/**
 * Generate JWT refresh token
 * @param userId User ID
 * @param email User email
 * @param jti Token ID for rotation
 * @returns string Refresh token
 */
export function generateRefreshToken(
  userId: string,
  email: string,
  jti: string
): string {
  const payload: RefreshTokenPayload = {
    sub: userId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: 0, // Will be set by jwt.sign
    jti,
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
    issuer: 'cornexconnect',
    audience: 'cornexconnect-api',
  });
}

/**
 * Generate both access and refresh tokens
 * @param userId User ID
 * @param email User email
 * @param roles User roles
 * @returns AuthToken Both tokens
 */
export function generateTokenPair(
  userId: string,
  email: string,
  roles: string[] = ['user']
): AuthToken {
  const jti = nanoid();
  const accessToken = generateAccessToken(userId, email, roles, jti);
  const refreshToken = generateRefreshToken(userId, email, jti);

  return {
    accessToken,
    refreshToken,
    expiresIn: parseInt(JWT_EXPIRY) || 900, // 15 minutes in seconds
    tokenType: 'Bearer',
  };
}

/**
 * Verify and decode access token
 * @param token JWT token
 * @returns DecodedToken Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyAccessToken(token: string): DecodedToken {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'cornexconnect',
      audience: 'cornexconnect-api',
    }) as DecodedToken;

    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Verify and decode refresh token
 * @param token Refresh token
 * @returns RefreshTokenPayload Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'cornexconnect',
      audience: 'cornexconnect-api',
    }) as RefreshTokenPayload;

    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Generate a secure random token for password reset or email verification
 * @param length Token length in bytes
 * @returns string Hex encoded token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a token (for storage in database)
 * @param token Plain text token
 * @returns string Hashed token
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate CSRF token
 * @returns string CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate CSRF token
 * @param token CSRF token to validate
 * @param storedToken Stored CSRF token
 * @returns boolean
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(storedToken)
  );
}

export default {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  generateSecureToken,
  hashToken,
  generateCSRFToken,
  validateCSRFToken,
};
