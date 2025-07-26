/**
 * 🧪 DATA MANAGEMENT RESILIENCE SERVICE UNIT TESTS
 *
 * Comprehensive test suite for the resilience service including:
 * - Circuit breaker functionality
 * - Health monitoring
 * - Retry mechanisms
 * - Fallback behavior
 *
 * Author: Endawoke47
 * Created: 2025-07-13
 */

import { DataManagementResilienceService } from '../../../src/services/data-management-resilience-express.service';

// Mock dependencies
jest.mock('ioredis');
jest.mock('pg');

describe('DataManagementResilienceService', () => {
  let resilienceService: any;
  let mockDataHub: any;
  let mockContextProvider: any;
  let mockRedis: any;
  let mockDbPool: any;

  beforeEach(() => {
    // Mock Redis
    mockRedis = {
      ping: jest.fn(),
      disconnect: jest.fn(),
      on: jest.fn(),
    } as any;

    // Mock PostgreSQL Pool
    mockDbPool = {
      query: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
    } as any;

    // Mock Data Hub
    mockDataHub = {
      query: jest.fn(),
      getPerformanceMetrics: jest.fn().mockReturnValue({
        responseTime: 150,
        queriesPerSecond: 45,
        cacheHitRatio: 0.85,
      }),
    };

    // Mock Context Provider
    mockContextProvider = {
      getContextualData: jest.fn(),
    };

    // Initialize service
    resilienceService = new DataManagementResilienceService(
      mockDataHub,
      mockContextProvider,
      mockRedis,
      mockDbPool
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Circuit Breaker Functionality', () => {
    it('should remain closed when operations succeed', async () => {
      // Arrange
      mockDataHub.query.mockResolvedValue({ data: 'success' });

      // Act
      const result = await resilienceService.resilientQuery('test', {});
      const health = resilienceService.getSystemHealth();

      // Assert
      expect(result).toEqual({ data: 'success' });
      expect(health.circuitBreaker.isOpen).toBe(false);
      expect(health.circuitBreaker.failures).toBe(0);
    });

    it('should open circuit breaker after threshold failures', async () => {
      // Arrange
      const error = new Error('Service unavailable');
      mockDataHub.query.mockRejectedValue(error);
      mockDbPool.query.mockRejectedValue(error);

      // Act - Trigger failures up to threshold (5)
      for (let i = 0; i < 5; i++) {
        try {
          await resilienceService.resilientQuery('test', {});
        } catch (e) {
          // Expected to fail
        }
      }

      const health = resilienceService.getSystemHealth();

      // Assert
      expect(health.circuitBreaker.isOpen).toBe(true);
      expect(health.circuitBreaker.failures).toBeGreaterThanOrEqual(5);
    });

    it('should fail fast when circuit breaker is open', async () => {
      // Arrange - Open the circuit breaker
      const error = new Error('Service unavailable');
      mockDataHub.query.mockRejectedValue(error);
      mockDbPool.query.mockRejectedValue(error);

      // Trigger failures to open circuit
      for (let i = 0; i < 5; i++) {
        try {
          await resilienceService.resilientQuery('test', {});
        } catch (e) {
          // Expected to fail
        }
      }

      const startTime = Date.now();

      // Act
      try {
        await resilienceService.resilientQuery('test', {});
      } catch (err) {
        const error = err as Error;
        const duration = Date.now() - startTime;

        // Assert - Should fail fast (under 100ms)
        expect(duration).toBeLessThan(100);
        expect(error.message).toContain('Circuit breaker is open');
      }
    });

    it('should reset circuit breaker manually', async () => {
      // Arrange - Open circuit breaker
      const error = new Error('Service unavailable');
      mockDataHub.query.mockRejectedValue(error);
      mockDbPool.query.mockRejectedValue(error);

      for (let i = 0; i < 5; i++) {
        try {
          await resilienceService.resilientQuery('test', {});
        } catch (e) {
          // Expected to fail
        }
      }

      // Act
      await resilienceService.resetCircuitBreaker();
      const health = resilienceService.getSystemHealth();

      // Assert
      expect(health.circuitBreaker.isOpen).toBe(false);
      expect(health.circuitBreaker.failures).toBe(0);
    });
  });

  describe('Retry Mechanisms', () => {
    it('should retry failed operations with exponential backoff', async () => {
      // Arrange
      let callCount = 0;
      mockDataHub.query.mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({ data: 'success after retries' });
      });

      const startTime = Date.now();

      // Act
      const result = await resilienceService.resilientQuery('test', {});
      const duration = Date.now() - startTime;

      // Assert
      expect(result).toEqual({ data: 'success after retries' });
      expect(callCount).toBe(3);
      // Should take at least 3 seconds due to exponential backoff (1s + 2s)
      expect(duration).toBeGreaterThan(3000);
    });

    it('should respect maximum retry attempts', async () => {
      // Arrange
      let callCount = 0;
      mockDataHub.query.mockImplementation(() => {
        callCount++;
        return Promise.reject(new Error('Persistent failure'));
      });
      mockDbPool.query.mockRejectedValue(new Error('DB also failing'));

      // Act & Assert
      await expect(resilienceService.resilientQuery('test', {})).rejects.toThrow(
        'All fallback mechanisms exhausted'
      );

      // Should attempt primary + 3 retries = 4 attempts on hub
      // Plus 1 attempt on direct database
      expect(callCount).toBe(4);
    });
  });

  describe('Fallback Mechanisms', () => {
    it('should fallback to direct database when hub fails', async () => {
      // Arrange
      mockDataHub.query.mockRejectedValue(new Error('Hub failure'));
      mockDbPool.query.mockResolvedValue({
        rows: [{ id: 1, data: 'fallback data' }],
      });

      // Act
      const result = await resilienceService.resilientQuery('findOne', {
        entity: 'TestEntity',
        options: { where: { id: 1 } },
      });

      // Assert
      expect(result).toEqual({ rows: [{ id: 1, data: 'fallback data' }] });
      expect(mockDbPool.query).toHaveBeenCalled();
    });

    it('should throw error when all fallbacks fail', async () => {
      // Arrange
      mockDataHub.query.mockRejectedValue(new Error('Hub failure'));
      mockDbPool.query.mockRejectedValue(new Error('Database failure'));

      // Act & Assert
      await expect(resilienceService.resilientQuery('test', {})).rejects.toThrow(
        'All fallback mechanisms exhausted'
      );
    });
  });

  describe('Health Monitoring', () => {
    it('should return comprehensive system health', () => {
      // Act
      const health = resilienceService.getSystemHealth();

      // Assert
      expect(health).toHaveProperty('circuitBreaker');
      expect(health).toHaveProperty('metrics');
      expect(health).toHaveProperty('cacheHitRatio');
      expect(health).toHaveProperty('uptime');
      expect(health.circuitBreaker).toHaveProperty('isOpen');
      expect(health.circuitBreaker).toHaveProperty('failures');
      expect(health.metrics).toHaveProperty('totalRequests');
      expect(health.metrics).toHaveProperty('successfulRequests');
      expect(health.metrics).toHaveProperty('failedRequests');
    });

    it('should track request metrics correctly', async () => {
      // Arrange
      mockDataHub.query.mockResolvedValue({ data: 'success' });

      // Act
      await resilienceService.resilientQuery('test1', {});
      await resilienceService.resilientQuery('test2', {});

      const health = resilienceService.getSystemHealth();

      // Assert
      expect(health.metrics.totalRequests).toBe(2);
      expect(health.metrics.successfulRequests).toBe(2);
      expect(health.metrics.failedRequests).toBe(0);
    });

    it('should track failure metrics correctly', async () => {
      // Arrange
      mockDataHub.query.mockRejectedValue(new Error('Failure'));
      mockDbPool.query.mockRejectedValue(new Error('DB Failure'));

      // Act
      try {
        await resilienceService.resilientQuery('test', {});
      } catch (e) {
        // Expected to fail
      }

      const health = resilienceService.getSystemHealth();

      // Assert
      expect(health.metrics.totalRequests).toBe(1);
      expect(health.metrics.successfulRequests).toBe(0);
      expect(health.metrics.failedRequests).toBe(1);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track average response time', async () => {
      // Arrange
      mockDataHub.query.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve({ data: 'delayed response' }), 100);
        });
      });

      // Act
      await resilienceService.resilientQuery('test', {});
      const health = resilienceService.getSystemHealth();

      // Assert
      expect(health.metrics.avgResponseTime).toBeGreaterThan(90);
      expect(health.metrics.avgResponseTime).toBeLessThan(200);
    });

    it('should maintain cache hit ratio from data hub', () => {
      // Act
      const health = resilienceService.getSystemHealth();

      // Assert
      expect(health.cacheHitRatio).toBe(0.85);
    });
  });

  describe('Context Provider Resilience', () => {
    it('should handle context provider queries with resilience', async () => {
      // Arrange
      mockContextProvider.getContextualData.mockResolvedValue({
        contextData: 'test context',
      });

      // Act
      const result = await resilienceService.resilientContextQuery({
        userId: 'test-user',
        module: 'client-portal',
      });

      // Assert
      expect(result).toEqual({ contextData: 'test context' });
      expect(mockContextProvider.getContextualData).toHaveBeenCalledWith({
        userId: 'test-user',
        module: 'client-portal',
      });
    });

    it('should fallback when context provider fails', async () => {
      // Arrange
      mockContextProvider.getContextualData.mockRejectedValue(
        new Error('Context provider failure')
      );

      // Act
      const result = await resilienceService.resilientContextQuery({
        userId: 'test-user',
        module: 'client-portal',
      });

      // Assert
      expect(result).toEqual({
        fallback: true,
        data: { userId: 'test-user', module: 'client-portal' },
        message: 'Context provider unavailable, using fallback',
      });
    });
  });
});
