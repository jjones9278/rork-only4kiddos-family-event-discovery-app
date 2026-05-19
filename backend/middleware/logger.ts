import type { Context, Next } from 'hono';

export function logger() {
  return async (c: Context, next: Next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    const method = c.req.method;
    const url = new URL(c.req.url);
    const status = c.res.status;
    console.log(`${method} ${url.pathname} ${status} ${ms}ms`);
  };
}