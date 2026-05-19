// tRPC procedures for Only4kiddos backend
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import type { Context } from './context';

// Initialize tRPC with context
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === 'BAD_REQUEST' && error.cause?.name === 'ZodError'
            ? (error.cause as any).flatten()
            : null,
      },
    };
  },
});

// Base router and procedure
export const router = t.router;
export const procedure = t.procedure;

// Public procedure (no auth required)
export const publicProcedure = t.procedure;

// Protected procedure (requires authentication)
export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts;
  
  // Check if user is authenticated
  if (!ctx.auth) {
    throw new TRPCError({ 
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Please log in to continue.',
    });
  }

  // Add auth to context for protected procedures
  return opts.next({
    ctx: {
      ...ctx,
      auth: ctx.auth, // Now TypeScript knows auth is not null
    },
  });
});

// Host procedure (requires host or admin role)
export const hostProcedure = protectedProcedure.use(async (opts) => {
  const { ctx } = opts;
  
  if (ctx.auth.role !== 'host' && ctx.auth.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Host privileges required for this action.',
    });
  }

  return opts.next({
    ctx,
  });
});

// Admin procedure (requires admin role)
export const adminProcedure = protectedProcedure.use(async (opts) => {
  const { ctx } = opts;
  
  if (ctx.auth.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Administrator privileges required for this action.',
    });
  }

  return opts.next({
    ctx,
  });
});