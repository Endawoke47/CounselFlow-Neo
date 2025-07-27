/**
 * 🔗 DATABASE AND REDIS CONNECTION SETUP
 *
 * Provides database and Redis connections for the resilience service
 *
 * Author: Endawoke47
 * Created: 2025-07-13
 */

import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { env } from './environment';
import { logger } from './logger';

// Prisma Client Setup
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Redis Setup
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  connectTimeout: 10000,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

// PostgreSQL Connection Pool (for direct database access)
export const dbPool = new Pool({
  connectionString: env.DATABASE_URL,
  min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
  max: parseInt(process.env.DATABASE_POOL_MAX || '10'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Connection Event Handlers
redis.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redis.on('error', error => {
  logger.error('❌ Redis connection error:', error);
});

dbPool.on('connect', () => {
  logger.info('✅ PostgreSQL pool connected');
});

dbPool.on('error', error => {
  logger.error('❌ PostgreSQL pool error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🔄 Shutting down database connections...');

  await prisma.$disconnect();
  redis.disconnect();
  await dbPool.end();

  logger.info('✅ Database connections closed');
  process.exit(0);
});

// Health check functions
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
}

export async function checkRedisHealth(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return false;
  }
}
