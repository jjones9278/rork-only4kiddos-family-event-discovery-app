import app from './hono';

const port = parseInt(process.env.PORT || '3001');

console.log(`Starting tRPC backend server on port ${port}...`);

// Use Bun's built-in server
Bun.serve({
  port: port,
  fetch: app.fetch,
});

console.log(`🚀 tRPC Backend running on http://localhost:${port}`);
console.log(`📡 tRPC endpoint: http://localhost:${port}/trpc`);
console.log(`💚 Health check: http://localhost:${port}/health`);