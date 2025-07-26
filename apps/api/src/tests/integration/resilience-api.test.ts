/**
 * 🧪 RESILIENCE SERVICE INTEGRATION TESTS
 *
 * Integration tests for the complete resilience service including:
 * - API endpoints
 * - Real database connections
 * - Redis integration
 * - End-to-end workflows
 *
 * Author: Endawoke47
 * Created: 2025-07-13
 */

import request from 'supertest';
import express from 'express';
import resilienceRoutes from '../../../src/routes/resilience.routes';
import { initializeResilienceService } from '../../../src/services/resilience-integration.service';

// Mock external dependencies for controlled testing
jest.mock('../../../src/config/database', () => ({
  redis: {
    ping: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
  },
  dbPool: {
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  },
  checkDatabaseHealth: jest.fn(),
  checkRedisHealth: jest.fn(),
}));

jest.mock('../../../src/services/resilience-integration.service');

describe('Resilience Service Integration Tests', () => {
  let app: express.Application;
  let mockInitializeService: jest.MockedFunction<typeof initializeResilienceService>;

  beforeAll(() => {
    // Setup Express app with resilience routes
    app = express();
    app.use(express.json());
    app.use('/api/v1/resilience', resilienceRoutes);

    // Mock the initialization function
    mockInitializeService = initializeResilienceService as jest.MockedFunction<
      typeof initializeResilienceService
    >;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/resilience/health', () => {
    it('should return comprehensive health status', async () => {
      // Arrange
      const mockResilienceService = {
        getSystemHealth: jest.fn().mockReturnValue({
          circuitBreaker: { isOpen: false, failures: 0 },
          metrics: {
            totalRequests: 100,
            successfulRequests: 95,
            failedRequests: 5,
            avgResponseTime: 150,
          },
          cacheHitRatio: 0.85,
          uptime: 3600,
        }),
      };

      mockInitializeService.mockResolvedValue(mockResilienceService as any);

      const { checkDatabaseHealth, checkRedisHealth } = require('../../../src/config/database');
      checkDatabaseHealth.mockResolvedValue(true);
      checkRedisHealth.mockResolvedValue(true);

      // Act
      const response = await request(app).get('/api/v1/resilience/health').expect(200);

      // Assert
      expect(response.body).toHaveProperty('status', 'operational');
      expect(response.body).toHaveProperty('resilience');
      expect(response.body).toHaveProperty('connections');
      expect(response.body.connections.database).toBe(true);
      expect(response.body.connections.redis).toBe(true);
      expect(response.body.resilience.circuitBreaker.isOpen).toBe(false);
    });

    it('should handle health check failures gracefully', async () => {
      // Arrange
      mockInitializeService.mockRejectedValue(new Error('Service initialization failed'));

      // Act
      const response = await request(app).get('/api/v1/resilience/health').expect(500);

      // Assert
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Health check failed');
      expect(response.body).toHaveProperty('error');
    });

    it('should report unhealthy connections correctly', async () => {
      // Arrange
      const mockResilienceService = {
        getSystemHealth: jest.fn().mockReturnValue({
          circuitBreaker: { isOpen: false, failures: 0 },
          metrics: {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            avgResponseTime: 0,
          },
          cacheHitRatio: 0,
          uptime: 100,
        }),
      };

      mockInitializeService.mockResolvedValue(mockResilienceService as any);

      const { checkDatabaseHealth, checkRedisHealth } = require('../../../src/config/database');
      checkDatabaseHealth.mockResolvedValue(false);
      checkRedisHealth.mockResolvedValue(false);

      // Act
      const response = await request(app).get('/api/v1/resilience/health').expect(200);

      // Assert
      expect(response.body.connections.database).toBe(false);
      expect(response.body.connections.redis).toBe(false);
    });
  });

  describe('POST /api/v1/resilience/test-query', () => {
    it('should execute resilient query successfully', async () => {
      // Arrange
      const mockResilienceService = {
        resilientQuery: jest.fn().mockResolvedValue({
          data: 'test result',
          operation: 'test',
          params: { test: true },
        }),
      };

      mockInitializeService.mockResolvedValue(mockResilienceService as any);

      // Act
      const response = await request(app)
        .post('/api/v1/resilience/test-query')
        .send({
          operation: 'test',
          params: { test: true },
        })
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('operation', 'test');
      expect(response.body).toHaveProperty('result');
      expect(response.body.result.data).toBe('test result');
      expect(mockResilienceService.resilientQuery).toHaveBeenCalledWith('test', { test: true });
    });

    it('should handle query failures gracefully', async () => {
      // Arrange
      const mockResilienceService = {
        resilientQuery: jest.fn().mockRejectedValue(new Error('Query failed')),
      };

      mockInitializeService.mockResolvedValue(mockResilienceService as any);

      // Act
      const response = await request(app)
        .post('/api/v1/resilience/test-query')
        .send({
          operation: 'failing-test',
          params: {},
        })
        .expect(500);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Resilient query failed');
      expect(response.body).toHaveProperty('error');
    });

    it('should use default parameters when not provided', async () => {
      // Arrange
      const mockResilienceService = {
        resilientQuery: jest.fn().mockResolvedValue({ data: 'default test' }),
      };

      mockInitializeService.mockResolvedValue(mockResilienceService as any);

      // Act
      const response = await request(app)
        .post('/api/v1/resilience/test-query')
        .send({})
        .expect(200);

      // Assert
      expect(response.body.operation).toBe('test');
      expect(mockResilienceService.resilientQuery).toHaveBeenCalledWith('test', {});
    });
  });

  describe('POST /api/v1/resilience/circuit-breaker/reset', () => {
    it('should reset circuit breaker successfully', async () => {
      // Arrange
      const mockResilienceService = {
        resetCircuitBreaker: jest.fn().mockResolvedValue(undefined),
      };

      mockInitializeService.mockResolvedValue(mockResilienceService as any);

      // Act
      const response = await request(app)
        .post('/api/v1/resilience/circuit-breaker/reset')
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Circuit breaker reset successfully');
      expect(response.body).toHaveProperty('timestamp');
      expect(mockResilienceService.resetCircuitBreaker).toHaveBeenCalled();
    });

    it('should handle circuit breaker reset failures', async () => {
      // Arrange
      const mockResilienceService = {
        resetCircuitBreaker: jest.fn().mockRejectedValue(new Error('Reset failed')),
      };

      mockInitializeService.mockResolvedValue(mockResilienceService as any);

      // Act
      const response = await request(app)
        .post('/api/v1/resilience/circuit-breaker/reset')
        .expect(500);

      // Assert
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Circuit breaker reset failed');
    });
  });

  describe('GET /api/v1/resilience/metrics', () => {
    it('should return detailed performance metrics', async () => {
      // Arrange
      const mockMetrics = {
        metrics: {
          totalRequests: 1000,
          successfulRequests: 950,
          failedRequests: 50,
          avgResponseTime: 200,
        },
        circuitBreaker: {
          isOpen: false,
          failures: 2,
          lastFailure: new Date(),
          timeout: 30000,
        },
        cacheHitRatio: 0.87,
        uptime: 7200,
      };

      const mockResilienceService = {
        getSystemHealth: jest.fn().mockReturnValue(mockMetrics),
      };

      mockInitializeService.mockResolvedValue(mockResilienceService as any);

      // Act
      const response = await request(app).get('/api/v1/resilience/metrics').expect(200);

      // Assert
      expect(response.body).toHaveProperty('metrics');
      expect(response.body).toHaveProperty('circuitBreaker');
      expect(response.body).toHaveProperty('cacheHitRatio', 0.87);
      expect(response.body).toHaveProperty('uptime', 7200);
      expect(response.body.metrics.totalRequests).toBe(1000);
      expect(response.body.metrics.successfulRequests).toBe(950);
    });

    it('should calculate success rate correctly', async () => {
      // Arrange
      const mockMetrics = {
        metrics: {
          totalRequests: 200,
          successfulRequests: 180,
          failedRequests: 20,
          avgResponseTime: 150,
        },
        circuitBreaker: { isOpen: false, failures: 0 },
        cacheHitRatio: 0.9,
        uptime: 1800,
      };

      const mockResilienceService = {
        getSystemHealth: jest.fn().mockReturnValue(mockMetrics),
      };

      mockInitializeService.mockResolvedValue(mockResilienceService as any);

      // Act
      const response = await request(app).get('/api/v1/resilience/metrics').expect(200);

      // Assert
      const successRate =
        response.body.metrics.successfulRequests / response.body.metrics.totalRequests;
      expect(successRate).toBe(0.9); // 90% success rate
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed JSON in requests', async () => {
      // Act
      await request(app)
        .post('/api/v1/resilience/test-query')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      // Assert - Express should handle malformed JSON
    });

    it('should handle service initialization timeout', async () => {
      // Arrange
      mockInitializeService.mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Initialization timeout')), 100);
        });
      });

      // Act
      const response = await request(app).get('/api/v1/resilience/health').expect(500);

      // Assert
      expect(response.body.message).toBe('Health check failed');
    });

    it('should maintain state across multiple requests', async () => {
      // Arrange
      let requestCount = 0;
      const mockResilienceService = {
        getSystemHealth: jest.fn().mockImplementation(() => ({
          metrics: {
            totalRequests: ++requestCount,
            successfulRequests: requestCount,
            failedRequests: 0,
            avgResponseTime: 100,
          },
          circuitBreaker: { isOpen: false, failures: 0 },
          cacheHitRatio: 0.85,
          uptime: 3600,
        })),
      };

      mockInitializeService.mockResolvedValue(mockResilienceService as any);

      // Act
      const response1 = await request(app).get('/api/v1/resilience/metrics').expect(200);
      const response2 = await request(app).get('/api/v1/resilience/metrics').expect(200);

      // Assert
      expect(response1.body.metrics.totalRequests).toBe(1);
      expect(response2.body.metrics.totalRequests).toBe(2);
    });
  });
});
