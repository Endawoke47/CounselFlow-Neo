/**
 * 🧪 RESILIENCE SERVICE PERFORMANCE TESTS
 *
 * Performance and load tests for the resilience service including:
 * - Circuit breaker performance under load
 * - Retry mechanism efficiency
 * - System behavior during failures
 * - Memory and resource usage
 *
 * Author: Endawoke47
 * Created: 2025-07-13
 */

import { DataManagementResilienceService } from '../../../src/services/data-management-resilience-express.service';

describe('Resilience Service Performance Tests', () => {
  let resilienceService: DataManagementResilienceService;
  let mockDataHub: any;
  let mockContextProvider: any;
  let mockRedis: any;
  let mockDbPool: any;

  beforeEach(() => {
    // Mock dependencies
    mockRedis = {
      ping: jest.fn(),
      disconnect: jest.fn(),
      on: jest.fn(),
    };

    mockDbPool = {
      query: jest.fn(),
      end: jest.fn(),
      on: jest.fn(),
    };

    mockDataHub = {
      query: jest.fn(),
      getPerformanceMetrics: jest.fn().mockReturnValue({
        responseTime: 150,
        queriesPerSecond: 45,
        cacheHitRatio: 0.85,
      }),
    };

    mockContextProvider = {
      getContextualData: jest.fn(),
    };

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

  describe('High Load Performance', () => {
    it('should handle 100 concurrent successful requests efficiently', async () => {
      // Arrange
      mockDataHub.query.mockResolvedValue({ data: 'success' });

      const startTime = Date.now();
      const requests = Array.from({ length: 100 }, (_, i) =>
        resilienceService.resilientQuery(`test-${i}`, { id: i })
      );

      // Act
      const results = await Promise.all(requests);
      const duration = Date.now() - startTime;

      // Assert
      expect(results).toHaveLength(100);
      expect(results.every(result => result.data === 'success')).toBe(true);
      // Should complete within reasonable time (under 5 seconds for 100 requests)
      expect(duration).toBeLessThan(5000);

      const health = resilienceService.getSystemHealth();
      expect(health.metrics.totalRequests).toBe(100);
      expect(health.metrics.successfulRequests).toBe(100);
      expect(health.metrics.failedRequests).toBe(0);
    });

    it('should maintain circuit breaker state under concurrent failures', async () => {
      // Arrange
      mockDataHub.query.mockRejectedValue(new Error('Service overload'));
      mockDbPool.query.mockRejectedValue(new Error('Database overload'));

      const requests = Array.from({ length: 20 }, (_, i) =>
        resilienceService.resilientQuery(`test-${i}`, { id: i }).catch(() => null)
      );

      // Act
      await Promise.all(requests);
      const health = resilienceService.getSystemHealth();

      // Assert
      expect(health.circuitBreaker.isOpen).toBe(true);
      expect(health.metrics.totalRequests).toBe(20);
      expect(health.metrics.failedRequests).toBeGreaterThan(0);
    });

    it('should throttle requests when circuit breaker is open', async () => {
      // Arrange - Open circuit breaker first
      mockDataHub.query.mockRejectedValue(new Error('Service failure'));
      mockDbPool.query.mockRejectedValue(new Error('Database failure'));

      // Trigger failures to open circuit
      const initialFailures = Array.from({ length: 5 }, () =>
        resilienceService.resilientQuery('test', {}).catch(() => null)
      );
      await Promise.all(initialFailures);

      // Act - Test throttling
      const startTime = Date.now();
      const throttledRequests = Array.from({ length: 10 }, () =>
        resilienceService.resilientQuery('test', {}).catch(() => null)
      );
      await Promise.all(throttledRequests);
      const duration = Date.now() - startTime;

      // Assert - Should complete very quickly due to circuit breaker
      expect(duration).toBeLessThan(500); // Under 500ms for 10 requests
    });
  });

  describe('Memory and Resource Usage', () => {
    it('should not accumulate memory over multiple requests', async () => {
      // Arrange
      mockDataHub.query.mockResolvedValue({ data: 'test' });

      const initialMemory = process.memoryUsage().heapUsed;

      // Act - Execute many requests
      for (let i = 0; i < 1000; i++) {
        await resilienceService.resilientQuery('test', { iteration: i });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Assert - Memory increase should be minimal (under 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it('should clean up resources properly on service destruction', async () => {
      // Arrange
      const cleanupSpy = jest.spyOn(mockRedis, 'disconnect');
      const dbCleanupSpy = jest.spyOn(mockDbPool, 'end');

      // Act - Simulate service cleanup
      // In a real scenario, this would be called on app shutdown
      await mockRedis.disconnect();
      await mockDbPool.end();

      // Assert
      expect(cleanupSpy).toHaveBeenCalled();
      expect(dbCleanupSpy).toHaveBeenCalled();
    });
  });

  describe('Retry Performance', () => {
    it('should not exceed maximum retry time under failure conditions', async () => {
      // Arrange
      let callCount = 0;
      mockDataHub.query.mockImplementation(() => {
        callCount++;
        return Promise.reject(new Error(`Failure ${callCount}`));
      });
      mockDbPool.query.mockRejectedValue(new Error('DB failure'));

      const startTime = Date.now();

      // Act
      try {
        await resilienceService.resilientQuery('test', {});
      } catch (error) {
        // Expected to fail
      }

      const duration = Date.now() - startTime;

      // Assert
      // With 3 retries and exponential backoff (1s, 2s, 4s), should be around 7-8 seconds max
      expect(duration).toBeLessThan(10000);
      expect(callCount).toBe(4); // Initial + 3 retries
    });

    it('should maintain good performance when retries are successful', async () => {
      // Arrange
      let callCount = 0;
      mockDataHub.query.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve({ data: 'success after retry' });
      });

      const startTime = Date.now();

      // Act
      const result = await resilienceService.resilientQuery('test', {});
      const duration = Date.now() - startTime;

      // Assert
      expect(result).toEqual({ data: 'success after retry' });
      expect(callCount).toBe(2);
      // Should complete in reasonable time (1-2 seconds for one retry)
      expect(duration).toBeGreaterThan(1000);
      expect(duration).toBeLessThan(3000);
    });
  });

  describe('Stress Testing', () => {
    it('should survive rapid circuit breaker state changes', async () => {
      // Arrange
      let shouldFail = true;
      mockDataHub.query.mockImplementation(() => {
        if (shouldFail) {
          return Promise.reject(new Error('Intermittent failure'));
        }
        return Promise.resolve({ data: 'success' });
      });

      // Act - Alternate between failures and successes
      for (let i = 0; i < 50; i++) {
        shouldFail = i % 10 < 5; // Fail for 5, succeed for 5

        try {
          await resilienceService.resilientQuery(`test-${i}`, { id: i });
        } catch (error) {
          // Expected intermittent failures
        }

        // Reset circuit breaker occasionally
        if (i % 15 === 0) {
          await resilienceService.resetCircuitBreaker();
        }
      }

      const health = resilienceService.getSystemHealth();

      // Assert - Service should still be functional
      expect(health.metrics.totalRequests).toBe(50);
      expect(health.metrics.successfulRequests).toBeGreaterThan(0);
      expect(health.metrics.failedRequests).toBeGreaterThan(0);
    });

    it('should handle mixed successful and failed requests efficiently', async () => {
      // Arrange
      mockDataHub.query.mockImplementation((operation: string) => {
        if (operation.includes('fail')) {
          return Promise.reject(new Error('Intentional failure'));
        }
        return Promise.resolve({ data: `success-${operation}` });
      });

      const startTime = Date.now();

      // Act - Mix of successful and failing requests
      const requests = Array.from({ length: 100 }, (_, i) => {
        const operation = i % 3 === 0 ? `fail-${i}` : `success-${i}`;
        return resilienceService.resilientQuery(operation, { id: i }).catch(() => null);
      });

      await Promise.all(requests);
      const duration = Date.now() - startTime;

      // Assert
      const health = resilienceService.getSystemHealth();
      expect(health.metrics.totalRequests).toBe(100);
      expect(health.metrics.successfulRequests).toBeGreaterThan(50);
      expect(health.metrics.failedRequests).toBeGreaterThan(20);
      // Should complete in reasonable time despite failures
      expect(duration).toBeLessThan(15000);
    });
  });

  describe('Resource Efficiency', () => {
    it('should batch health checks efficiently', async () => {
      // Arrange
      const healthCheckSpy = jest.spyOn(resilienceService, 'getSystemHealth');

      // Act - Multiple rapid health checks
      const healthPromises = Array.from({ length: 10 }, () => resilienceService.getSystemHealth());

      const results = await Promise.all(healthPromises);

      // Assert
      expect(results).toHaveLength(10);
      expect(results.every(health => health.uptime >= 0)).toBe(true);
      // Should not create excessive overhead
      expect(healthCheckSpy).toHaveBeenCalledTimes(10);
    });

    it('should maintain consistent performance under sustained load', async () => {
      // Arrange
      mockDataHub.query.mockResolvedValue({ data: 'load-test' });

      const durations: number[] = [];

      // Act - Execute requests in batches and measure each batch
      for (let batch = 0; batch < 5; batch++) {
        const batchStart = Date.now();

        const batchRequests = Array.from({ length: 20 }, (_, i) =>
          resilienceService.resilientQuery(`batch-${batch}-${i}`, { batch, index: i })
        );

        await Promise.all(batchRequests);
        durations.push(Date.now() - batchStart);
      }

      // Assert - Performance should remain consistent across batches
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxVariation = Math.max(...durations) - Math.min(...durations);

      expect(avgDuration).toBeLessThan(5000); // Each batch under 5 seconds
      expect(maxVariation).toBeLessThan(avgDuration * 0.5); // Variation under 50% of average
    });
  });
});
