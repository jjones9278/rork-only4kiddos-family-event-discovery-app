import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';
import { auth } from '@/config/firebase';

// Import the AppRouter type from your backend
import type { AppRouter } from '../backend/trpc/router';

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

// Function to get Firebase auth token
async function getAuthToken(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Create the tRPC client with auth headers
export const trpcClient = createTRPCClient<AppRouter>({
  transformer: superjson, // Transformer at root level for v11
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      headers: async () => {
        const token = await getAuthToken();
        return {
          Authorization: token ? `Bearer ${token}` : '',
        };
      },
    }),
  ],
});

// Function to get tRPC client instance
export function getTRPCClient() {
  return trpcClient;
}