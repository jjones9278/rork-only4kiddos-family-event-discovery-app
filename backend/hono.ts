import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { trpcServer } from '@hono/trpc-server';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import superjson from 'superjson';

// Initialize tRPC (need transformer here for client compatibility)
const t = initTRPC.create({
  transformer: superjson,
});

// Create reusable procedures
const publicProcedure = t.procedure;
const router = t.router;

// Define your API routes
export const appRouter = router({
  hello: publicProcedure
    .input(z.string().nullish())
    .query(({ input }) => {
      return {
        message: `Hello ${input ?? 'World'}!`,
        timestamp: new Date().toISOString(),
      };
    }),
  
  // Example protected procedure for family events
  createEvent: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      date: z.string(),
      location: z.string(),
    }))
    .mutation(({ input }) => {
      // This would typically save to your database
      return {
        id: Math.random().toString(36).substr(2, 9),
        ...input,
        createdAt: new Date().toISOString(),
      };
    }),
});

// Export the router type
export type AppRouter = typeof appRouter;

// Create Hono app
const app = new Hono();

// Add CORS middleware (restrict origins for security)
app.use('*', cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] // Replace with your actual domain
    : ['http://localhost:5000', 'http://127.0.0.1:5000'], // Local development
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Add tRPC middleware
app.use('/trpc/*', trpcServer({
  router: appRouter,
}));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export the app
export default app;