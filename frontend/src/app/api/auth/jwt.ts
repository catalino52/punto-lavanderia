import { SignJWT, jwtVerify } from 'jose';

// In a real application, this should be set as an environment variable
// and kept secret - never hardcoded like this
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'laundry-app-secret-key-change-this-in-production'
);

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

/**
 * Generate a JWT token for a user
 */
export async function generateToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (typeof payload.userId !== 'string' || typeof payload.username !== 'string' || typeof payload.role !== 'string') {
      return null;
    }
    return { userId: payload.userId, username: payload.username, role: payload.role };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Parse a JWT token from an Authorization header
 */
export function parseAuthHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
} 
