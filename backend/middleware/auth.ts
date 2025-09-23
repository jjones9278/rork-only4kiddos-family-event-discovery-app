// Firebase Auth middleware for tRPC backend
import { TRPCError } from '@trpc/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';

// Initialize Firebase Admin (only once)
let adminApp: any;

function getFirebaseAdmin() {
  if (adminApp) return adminApp;
  
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    
    if (!projectId) {
      throw new Error('FIREBASE_PROJECT_ID environment variable is required');
    }

    // Production requires service account credentials
    if (process.env.NODE_ENV === 'production') {
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      if (!clientEmail || !privateKey) {
        throw new Error('Production requires FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables');
      }

      try {
        adminApp = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } catch (error) {
        console.error('Firebase Admin production initialization error:', error);
        throw new Error('Failed to initialize Firebase Admin with service account credentials');
      }
    } else {
      // Development: simplified project ID only
      console.log('[DEV] Initializing Firebase Admin with project ID only - NOT FOR PRODUCTION');
      try {
        adminApp = initializeApp({
          projectId: projectId,
        });
      } catch (error) {
        console.error('Firebase Admin development initialization error:', error);
        throw new Error('Failed to initialize Firebase Admin in development mode');
      }
    }
  } else {
    adminApp = getApps()[0];
  }
  
  return adminApp;
}

export interface AuthContext {
  userId: string;
  email: string;
  displayName?: string;
  role: 'user' | 'host' | 'admin';
  emailVerified: boolean;
}

export async function verifyFirebaseToken(token: string): Promise<AuthContext> {
  try {
    const admin = getFirebaseAdmin();
    const auth = getAuth(admin);
    
    // Verify the ID token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Extract user information
    const userId = decodedToken.uid;
    const email = decodedToken.email;
    const displayName = decodedToken.name;
    const emailVerified = decodedToken.email_verified || false;
    
    // Get custom claims (role) - defaults to 'user'
    const role = (decodedToken.role as 'user' | 'host' | 'admin') || 'user';

    if (!email) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Token does not contain valid email',
      });
    }

    return {
      userId,
      email,
      displayName,
      role,
      emailVerified,
    };
  } catch (error) {
    console.error('Firebase token verification error:', error);
    
    if (error instanceof TRPCError) {
      throw error;
    }
    
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired authentication token',
    });
  }
}

export function extractTokenFromHeader(authorization?: string): string | null {
  if (!authorization) {
    return null;
  }

  // Expected format: "Bearer <token>"
  const parts = authorization.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

// Simplified auth for development (when Firebase Admin is not fully configured)
export async function verifyTokenDev(token: string): Promise<AuthContext> {
  console.warn('Using development auth - not suitable for production!');
  
  // In development, we'll accept any token that looks like a Firebase token
  // and create a mock user context
  if (!token || token.length < 10) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid token format',
    });
  }

  // Create mock user for development
  const userId = `dev-user-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    userId,
    email: 'dev@only4kiddos.com',
    displayName: 'Development User',
    role: 'user',
    emailVerified: true,
  };
}

export async function createAuthContext(authHeader?: string): Promise<AuthContext | null> {
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    return null;
  }

  try {
    // Try Firebase Admin auth first
    return await verifyFirebaseToken(token);
  } catch (error) {
    // ONLY fall back to dev auth in development - NEVER in production
    if (process.env.NODE_ENV === 'development' && process.env.NODE_ENV !== 'production') {
      console.warn('[DEV ONLY] Firebase Admin auth failed, falling back to dev auth - THIS MUST NOT RUN IN PRODUCTION');
      return await verifyTokenDev(token);
    }
    
    // In production, fail closed
    console.error('Firebase auth failed in production:', error);
    throw error;
  }
}