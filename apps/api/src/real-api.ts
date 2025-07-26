/**
 * 🚀 REAL SERVICES API SERVER
 * ===========================
 * Simplified API server running only our new real services
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import winston from 'winston';

// Load environment variables
dotenv.config();

// Import our real services
import realAuthRoutes from './routes/auth-real.routes';
import realContractRoutes from './routes/real-contract.routes';
import realClientRoutes from './routes/real-client.routes';

const app = express();
const PORT = process.env.PORT || 3006; // Use different port to avoid conflicts

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/real-api.log' }),
    new winston.transports.Console(),
  ],
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({
    success: true,
    message: 'CounselFlow Real Services API is operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      authentication: 'operational',
      contracts: 'operational',
      clients: 'operational',
    },
  });
});

// API Documentation
app.get('/', (_, res) => {
  res.json({
    success: true,
    message: 'CounselFlow Real Services API',
    version: '2.0.0',
    documentation: {
      authentication: 'POST /api/auth/register, POST /api/auth/login',
      contracts: 'GET|POST|PUT|DELETE /api/contracts',
      clients: 'GET|POST|PUT|DELETE /api/clients',
    },
    endpoints: {
      health: 'GET /health',
      auth: 'POST /api/auth/*',
      contracts: 'CRUD /api/contracts/*',
      clients: 'CRUD /api/clients/*',
    },
  });
});

// 🔥 REAL API ROUTES
app.use('/api/auth', realAuthRoutes);
app.use('/api/contracts', realContractRoutes);
app.use('/api/clients', realClientRoutes);

// Error handling middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'GET /health',
      'GET /',
      'POST /api/auth/*',
      'CRUD /api/contracts/*',
      'CRUD /api/clients/*',
    ],
  });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('API Error:', error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 CounselFlow Real Services API running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  logger.info(`📖 API Documentation: http://localhost:${PORT}/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
