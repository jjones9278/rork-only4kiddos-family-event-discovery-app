// tRPC context creation for Only4kiddos backend
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { createAuthContext, type AuthContext } from '../middleware/auth';

export interface Context {
  auth: AuthContext | null;
  req: Request;
}

export async function createContext({ req }: FetchCreateContextFnOptions): Promise<Record<string, unknown>> {
  // Extract Authorization header
  const authHeader = req.headers.get('Authorization') || undefined;
  
  // Create auth context (null if no valid token)
  const auth = await createAuthContext(authHeader);

  return {
    auth,
    req,
  };
}