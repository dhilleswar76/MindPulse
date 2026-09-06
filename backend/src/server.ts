import express from 'express';
import http from 'http';
import cors from 'cors';
import { config } from './config/index.js';
import { connectDatabase } from './config/db.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/error.middleware.js';
import apiRouter from './routes/index.js';
import { initSocket } from './services/socket.service.js';

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Start server
const startServer = async (port: number = config.port) => {
  await connectDatabase();

  const currentServer = server.listen(port, () => {
    logger.info(`🚀 MindPulse Backend API running on port ${port} [${config.nodeEnv}]`);
    logger.info(`🔗 API Healthcheck: http://localhost:${port}/api/health`);
    logger.info(`🛡️ Non-Diagnostic Policy: Strictly Active`);
  });

  currentServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`Port ${port} in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      logger.error('Server error:', err);
    }
  });
};

startServer();

export { app, server };
