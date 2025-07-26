// API Server Entry Point
// User: Endawoke47
// Date: 2025-07-12 21:00:00 UTC

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment variables FIRST
dotenv.config();

import swaggerUi from 'swagger-ui-express';
import enhancedLogger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';
import { swaggerSpec } from './config/swagger';

// Routes
import authRoutes from './routes/auth-secure.routes';
import userRoutes from './routes/user.routes';
import contractRoutes from './routes/contract.routes';
import matterRoutes from './routes/matter.routes';
import disputeRoutes from './routes/dispute.routes';
import documentRoutes from './routes/document.routes';
import clientRoutes from './routes/client.routes';
import reportRoutes from './routes/report.routes';
import aiRoutes from './routes/ai.routes';
import legalResearchRoutes from './routes/legal-research.routes';
import { contractIntelligenceRoutes } from './routes/contract-intelligence.routes';
import legalIntelligenceRoutes from './routes/legal-intelligence.routes';
import documentAutomationRoutes from './routes/document-automation.routes';
import aiContractAnalysisRoutes from './routes/ai-contract-analysis.routes';
import resilienceRoutes from './routes/resilience.routes';
import realServices from './real-services';

const app = express();
const PORT = process.env.PORT || 3005;

// Add enhanced logging middleware first
app.use(enhancedLogger.httpLogger());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
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

// Logging middleware
app.use(requestLogger);

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// OpenAPI JSON specification endpoint
app.get('/api-docs.json', (_, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/contracts', contractRoutes);
app.use('/api/v1/matters', matterRoutes);
app.use('/api/v1/disputes', disputeRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/ai', aiRoutes);

// 🔥 REAL SERVICES - Fully functional implementations
app.use('/api/v2', realServices);

// AI-Powered Legal Services (Phase 2)
app.use('/api/v1/legal-research', legalResearchRoutes);
app.use('/api/v1/contract-intelligence', contractIntelligenceRoutes);
app.use('/api/v1/legal-intelligence', legalIntelligenceRoutes);
app.use('/api/v1/document-automation', documentAutomationRoutes);

// AI Contract Analysis (Phase 3)
app.use('/api/v1/ai/contracts', aiContractAnalysisRoutes);

// Data Management & Resilience
app.use('/api/v1/resilience', resilienceRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Create server and start listening
const server = app.listen(PORT, () => {
  enhancedLogger.info(`🚀 CounselFlow API Server running on port ${PORT}`);
  enhancedLogger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  enhancedLogger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  enhancedLogger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  enhancedLogger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});

export default app;
