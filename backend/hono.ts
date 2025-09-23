import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { trpcServer } from '@hono/trpc-server';
import { appRouter, type AppRouter } from './trpc/router';
import { createContext } from './trpc/context';

// Export the router type
export type { AppRouter };

// Create Hono app
const app = new Hono();

// Add CORS middleware (restrict origins for security)
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production: Use environment variable for allowed origins
    const prodOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    if (prodOrigins.length === 0) {
      console.warn('WARNING: No ALLOWED_ORIGINS set for production, defaulting to restrictive CORS');
      return ['https://only4kiddos.com']; // Fallback - replace with actual domain
    }
    return prodOrigins;
  } else {
    // Development: Allow local development origins
    return [
      'http://localhost:5000', 
      'http://127.0.0.1:5000',
      'http://localhost:8081', // Expo dev server
      'http://127.0.0.1:8081'
    ];
  }
};

app.use('*', cors({
  origin: getAllowedOrigins(),
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Add tRPC middleware
app.use('/trpc/*', trpcServer({
  router: appRouter,
  createContext,
}));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export the app
export default app;