/**
 * 🧪 RESILIENCE SERVICE DEMO ROUTE
 * 
 * Demonstrates the resilience service functionality with health checks
 * 
 * Author: Endawoke47
 * Created: 2025-07-13
 */

import { Router } from 'express';
import { initializeResilienceService, getResilienceService } from '../services/resilience-integration.service';
import { checkDatabaseHealth, checkRedisHealth } from '../config/database';
import { logger } from '../config/logger';

const router = Router();

// Initialize resilience service on first load
let initialized = false;

/**
 * GET /api/resilience/health
 * Returns comprehensive system health check
 */
router.get('/health', async (req, res) => {
  try {
    if (!initialized) {
      await initializeResilienceService();
      initialized = true;
    }

    const resilienceService = getResilienceService();
    const systemHealth = resilienceService.getSystemHealth();
    
    // Add direct connection checks
    const additionalChecks = {
      database: await checkDatabaseHealth(),
      redis: await checkRedisHealth(),
      timestamp: new Date()
    };

    res.json({
      status: 'operational',
      resilience: systemHealth,
      connections: additionalChecks
    });

  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/resilience/test-query
 * Test resilient query functionality
 */
router.post('/test-query', async (req, res) => {
  try {
    if (!initialized) {
      await initializeResilienceService();
      initialized = true;
    }

    const resilienceService = getResilienceService();
    const { operation = 'test', params = {} } = req.body;

    logger.info('Testing resilient query', { operation, params });

    const result = await resilienceService.resilientQuery(operation, params);

    res.json({
      success: true,
      operation,
      result,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Resilient query test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Resilient query failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/resilience/circuit-breaker/reset
 * Manually reset the circuit breaker
 */
router.post('/circuit-breaker/reset', async (req, res) => {
  try {
    if (!initialized) {
      await initializeResilienceService();
      initialized = true;
    }

    const resilienceService = getResilienceService();
    await resilienceService.resetCircuitBreaker();

    res.json({
      success: true,
      message: 'Circuit breaker reset successfully',
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Circuit breaker reset failed:', error);
    res.status(500).json({
      success: false,
      message: 'Circuit breaker reset failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/resilience/metrics
 * Get system performance metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    if (!initialized) {
      await initializeResilienceService();
      initialized = true;
    }

    const resilienceService = getResilienceService();
    const health = resilienceService.getSystemHealth();

    res.json({
      metrics: health.metrics,
      circuitBreaker: health.circuitBreaker,
      cacheHitRatio: health.cacheHitRatio,
      uptime: health.uptime,
      timestamp: new Date()
    });

  } catch (error) {
    logger.error('Metrics retrieval failed:', error);
    res.status(500).json({
      success: false,
      message: 'Metrics retrieval failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
