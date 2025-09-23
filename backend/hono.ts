import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { trpcServer } from '@hono/trpc-server';
import { appRouter, type AppRouter } from './trpc/router';
import { createContext } from './trpc/context';
import { rateLimit } from './middleware/rateLimit';
import { logger } from './middleware/logger';

// Export the router type
export type { AppRouter };

// Create Hono app
const app = new Hono();

// Add request logging and rate limiting
app.use('*', logger());
app.use('*', rateLimit());

// Add body size limit (1MB) - robust enforcement
app.use('*', async (c, next) => {
  const contentLength = c.req.header('content-length');
  const maxSize = 1_000_000; // 1MB limit
  
  // Reject if Content-Length exceeds limit
  if (contentLength && Number(contentLength) > maxSize) {
    return c.text('Payload too large', 413);
  }
  
  // Require Content-Length for body-containing methods to prevent bypass
  const method = c.req.method;
  if (['POST', 'PUT', 'PATCH'].includes(method) && !contentLength) {
    return c.json({ error: 'Content-Length header required' }, 400);
  }
  
  await next();
});

// Add CORS middleware (restrict origins for security)
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production: Use environment variable for allowed origins
    const prodOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
    if (prodOrigins.length === 0) {
      console.warn('WARNING: No ALLOWED_ORIGINS set for production, denying all origins for security');
      return []; // Deny all origins if none specified in production
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