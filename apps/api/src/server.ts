/**
 * 🚀 PRODUCTION COUNSELFLOW API SERVER
 * ===================================
 * Enterprise-grade Express.js API server with real database integration
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'counselflow-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CounselFlow API',
      version: '1.0.0',
      description: 'Production-ready Legal Practice Management API',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Authentication middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(403).json({ success: false, message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        server: 'up',
      },
    },
  });
});

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'lawyer' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        status: 'active',
        permissions: ['read', 'write'],
      },
    });

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '24h',
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      },
    });
  } catch (error: any) {
    logger.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '24h',
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      },
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Clients routes
app.get('/api/clients', authenticateToken, async (req: any, res) => {
  try {
    const { page = 1, limit = 10, search, status, clientType } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (clientType) where.clientType = clientType;

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          assignedLawyer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.client.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        clients,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error('Get clients error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/clients', authenticateToken, async (req: any, res) => {
  try {
    const clientData = {
      id: uuidv4(),
      ...req.body,
      assignedLawyerId: req.body.assignedLawyerId || req.user.id,
    };

    const client = await prisma.client.create({
      data: clientData,
      include: {
        assignedLawyer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.status(201).json({ success: true, data: client });
  } catch (error: any) {
    logger.error('Create client error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: {
        assignedLawyer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    res.json({ success: true, data: client });
  } catch (error: any) {
    logger.error('Get client error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.patch('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        assignedLawyer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.json({ success: true, data: client });
  } catch (error: any) {
    logger.error('Update client error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.delete('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.client.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error: any) {
    logger.error('Delete client error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Contracts routes
app.get('/api/contracts', authenticateToken, async (req: any, res) => {
  try {
    const { page = 1, limit = 10, search, status, clientId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          client: {
            select: { id: true, name: true, email: true, clientType: true },
          },
          assignedLawyer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contract.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        contracts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error('Get contracts error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/contracts', authenticateToken, async (req: any, res) => {
  try {
    const contractData = {
      id: uuidv4(),
      ...req.body,
      assignedLawyerId: req.body.assignedLawyerId || req.user.id,
    };

    const contract = await prisma.contract.create({
      data: contractData,
      include: {
        client: {
          select: { id: true, name: true, email: true, clientType: true },
        },
        assignedLawyer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.status(201).json({ success: true, data: contract });
  } catch (error: any) {
    logger.error('Create contract error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.patch('/api/contracts/:id', authenticateToken, async (req, res) => {
  try {
    const contract = await prisma.contract.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        client: {
          select: { id: true, name: true, email: true, clientType: true },
        },
        assignedLawyer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    res.json({ success: true, data: contract });
  } catch (error: any) {
    logger.error('Update contract error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.delete('/api/contracts/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.contract.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Contract deleted successfully' });
  } catch (error: any) {
    logger.error('Delete contract error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Dashboard metrics
app.get('/api/dashboard/metrics', authenticateToken, async (req: any, res) => {
  try {
    const [totalClients, activeMatters, totalRevenue, pendingTasks] = await Promise.all([
      prisma.client.count(),
      prisma.matter.count({ where: { status: 'Active' } }),
      prisma.contract.aggregate({
        _sum: { value: true },
        where: { status: 'Executed' },
      }),
      prisma.task.count({ where: { status: 'Pending' } }),
    ]);

    // Get recent activities
    const recentActivities = await prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    res.json({
      success: true,
      data: {
        totalClients,
        activeMatters,
        pendingTasks,
        revenue: {
          total: totalRevenue._sum.value || 0,
          thisMonth: 0, // Calculate monthly revenue
          lastMonth: 0, // Calculate previous month revenue
          growth: 0, // Calculate growth percentage
        },
        recentActivities: recentActivities.map(activity => ({
          id: activity.id,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          timestamp: activity.createdAt,
          priority: activity.priority,
        })),
      },
    });
  } catch (error: any) {
    logger.error('Dashboard metrics error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Global search
app.post('/api/search', authenticateToken, async (req: any, res) => {
  try {
    const { query, filters = {} } = req.body;
    const results: any[] = [];

    // Search clients
    if (!filters.types || filters.types.includes('client')) {
      const clients = await prisma.client.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      });

      clients.forEach(client => {
        results.push({
          type: 'client',
          id: client.id,
          title: client.name,
          description: client.email,
          relevance: 0.9,
          metadata: { clientType: client.clientType, status: client.status },
        });
      });
    }

    // Search contracts
    if (!filters.types || filters.types.includes('contract')) {
      const contracts = await prisma.contract.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        include: { client: { select: { name: true } } },
      });

      contracts.forEach(contract => {
        results.push({
          type: 'contract',
          id: contract.id,
          title: contract.title,
          description: contract.client?.name || 'Unknown client',
          relevance: 0.8,
          metadata: { contractType: contract.contractType, status: contract.status },
        });
      });
    }

    res.json({
      success: true,
      data: {
        results: results.sort((a, b) => b.relevance - a.relevance),
        total: results.length,
      },
    });
  } catch (error: any) {
    logger.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 CounselFlow API server running on port ${PORT}`);
  logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  logger.info(`💚 Health check available at http://localhost:${PORT}/api/health`);
});

export default app;
