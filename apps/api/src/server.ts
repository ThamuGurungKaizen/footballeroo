import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app } from './app';
import { env, validateEnv } from './config/env';

// Validate environment on startup
validateEnv();

// Create HTTP server and attach Socket.IO
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// --- WebSocket events ---
io.on('connection', (socket) => {
  console.warn(`[Socket] Client connected: ${socket.id}`);

  // Join room for live menu updates
  socket.on('subscribe:menu', () => {
    socket.join('menu-updates');
    socket.emit('subscribed', { room: 'menu-updates' });
  });

  // Join room for match events
  socket.on('subscribe:matches', () => {
    socket.join('match-events');
    socket.emit('subscribed', { room: 'match-events' });
  });

  socket.on('disconnect', () => {
    console.warn(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Make io accessible to route handlers via app.locals
app.set('io', io);

// --- Start Server ---
httpServer.listen(env.PORT, async () => {
  // Initialize stock
  const { initializeStock } = await import('./services/stock');
  initializeStock();

  // Initialize generation pipeline (subscribe to events)
  const { initGenerationPipeline } = await import('./services/generation');
  await initGenerationPipeline();

  console.warn(`
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║   Footballeroo API Server                ║
  ║   Running on port ${String(env.PORT).padEnd(25)}║
  ║   Environment: ${env.NODE_ENV.padEnd(23)}║
  ║   CORS origin: ${env.CORS_ORIGIN.padEnd(23)}║
  ║   OpenAI: ${env.OPENAI_API_KEY ? 'configured' : 'NOT SET (fallback mode)'}${' '.repeat(env.OPENAI_API_KEY ? 13 : 3)}║
  ║                                          ║
  ╚══════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.warn('[Server] SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    console.warn('[Server] Closed.');
    process.exit(0);
  });
});

export { io };
