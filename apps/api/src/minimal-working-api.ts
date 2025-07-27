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

// Auth verify endpoint (for token verification)
app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
    });
  }

  // For development, just return a mock user
  return res.status(200).json({
    success: true,
    message: 'Token verified',
    data: {
      user: {
        id: '1',
        email: 'demo@counselflow.com',
        firstName: 'Demo',
        lastName: 'User',
        role: 'admin',
        status: 'active',
      }
    },
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Basic validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  // For development, accept any valid-looking credentials
  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token: 'demo-token-12345',
      user: {
        id: '1',
        email: email,
        firstName: 'Demo',
        lastName: 'User',
        role: 'admin',
        status: 'active',
      }
    },
  });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logout successful',
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
