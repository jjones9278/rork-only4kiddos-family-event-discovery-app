import type { Context, Next } from 'hono';

type Bucket = { count: number; start: number };
const WINDOW_MS = 60_000;
const MAX = 60;
const buckets = new Map<string, Bucket>();

export function rateLimit() {
  return async (c: Context, next: Next) => {
    const now = Date.now();
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || c.req.header('x-real-ip') || c.req.raw.headers.get('cf-connecting-ip') || 'unknown';
    const bucket = buckets.get(ip) || { count: 0, start: now };
    if (now - bucket.start > WINDOW_MS) {
      bucket.count = 0;
      bucket.start = now;
    }
    bucket.count += 1;
    buckets.set(ip, bucket);
    if (bucket.count > MAX) {
      return c.text('Too many requests', 429);
    }
    await next();
  };
}