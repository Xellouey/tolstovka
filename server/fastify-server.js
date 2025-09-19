import 'dotenv/config';
import Fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
  }
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(500).send({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  });
});

// Plugins
await fastify.register(import('@fastify/cors'), {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tolstovka.vercel.app', /\.vercel\.app$/] 
    : true,
  credentials: true
});

await fastify.register(import('@fastify/cookie'), {
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  parseOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
});

await fastify.register(import('@fastify/jwt'), {
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  cookie: {
    cookieName: 'tolsovka-token',
    signed: false
  }
});

await fastify.register(import('@fastify/multipart'), {
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Static files
await fastify.register(import('@fastify/static'), {
  root: path.resolve(__dirname, '../uploads'),
  prefix: '/uploads/',
  decorateReply: false
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  await fastify.register(import('@fastify/static'), {
    root: path.resolve(__dirname, '../frontend/dist'),
    prefix: '/',
    decorateReply: false
  });
  
  // SPA fallback
  fastify.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api/')) {
      reply.status(404).send({ error: 'API endpoint not found' });
    } else {
      reply.sendFile('index.html');
    }
  });
}

// Initialize database and attach to fastify
const db = initDb();
fastify.decorate('db', db);

// Health check
fastify.get('/api/health', async () => {
  return { 
    ok: true, 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
});

// Import routes
const publicRoutes = (await import('./routes/public-fastify.js')).default;
const adminRoutes = (await import('./routes/admin-fastify.js')).default;
const uploadRoutes = (await import('./routes/upload-fastify.js')).default;

// Register routes
await fastify.register(publicRoutes, { prefix: '/api' });
await fastify.register(adminRoutes, { prefix: '/api/admin' });
await fastify.register(uploadRoutes, { prefix: '/api/admin' });

// Start server
const start = async () => {
  try {
    const PORT = process.env.PORT || 8080;
    const HOST = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`🚀 Fastify server running on http://${HOST}:${PORT}`);
    console.log(`📱 Frontend URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  try {
    await fastify.close();
    console.log('Server closed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start the server
start();