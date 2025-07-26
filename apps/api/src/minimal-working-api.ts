import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'API Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Test auth endpoint
app.post('/api/auth/test', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Auth endpoint working',
    data: { test: true },
  });
});

// Test clients endpoint
app.get('/api/clients/test', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Clients endpoint working',
    data: { clients: [] },
  });
});

// Test contracts endpoint
app.get('/api/contracts/test', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Contracts endpoint working',
    data: { contracts: [] },
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// 404 handler
app.use('*', (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.listen(PORT, () => {
  logger.info(`🚀 Minimal API Server running on port ${PORT}`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
});

export default app;
