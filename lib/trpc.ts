import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';

// Import the AppRouter type from your backend
import type { AppRouter } from '../backend/hono';

// Create the tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Get the API base URL - for local development, this will be your backend URL
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // In browser, default to localhost:3001 for development
    return process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  }
  return process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001';
};

// Create the tRPC client  
export const trpcClient = createTRPCClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
    }),
  ],
});