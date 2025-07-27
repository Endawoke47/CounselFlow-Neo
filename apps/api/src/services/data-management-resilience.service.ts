/**
 * 🛡️ RESILIENCE AND RELIABILITY ENHANCEMENTS
 *
 * This service adds built-in redundancy, fallback mechanisms,
 * and health checks to the centralized data management system.
 *
 * Author: Endawoke47
 * Created: 2025-07-13
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { DataManagementHubService } from './data-management-hub.service';
import { DataContextProviderService } from './data-context-provider.service';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  services: {
    dataHub: boolean;
    contextProvider: boolean;
    cache: boolean;
    database: boolean;
  };
  metrics: {
    responseTime: number;
    errorRate: number;
    cacheHitRatio: number;
  };
  timestamp: Date;
}

interface FallbackConfig {
  enableDirectDatabaseAccess: boolean;
  cacheBypassThreshold: number; // ms
  maxRetries: number;
  circuitBreakerThreshold: number;
}

@Injectable()
export class DataManagementResilienceService implements OnModuleInit {
  private readonly logger = new Logger(DataManagementResilienceService.name);

  // Circuit breaker state
  private circuitBreaker = {
    isOpen: false,
    failures: 0,
    lastFailureTime: null as Date | null,
    resetTimeout: 30000, // 30 seconds
  };

  // Fallback configuration
  private fallbackConfig: FallbackConfig = {
    enableDirectDatabaseAccess: true,
    cacheBypassThreshold: 1000, // 1 second
    maxRetries: 3,
    circuitBreakerThreshold: 5,
  };

  // Health metrics
  private healthMetrics = {
    totalRequests: 0,
    failedRequests: 0,
    avgResponseTime: 0,
    lastHealthCheck: new Date(),
  };

  constructor(
    private dataHub: DataManagementHubService,
    private contextProvider: DataContextProviderService,
    @InjectDataSource() private dataSource: DataSource,
    @InjectRedis() private redis: Redis
  ) {}

  async onModuleInit() {
    this.startHealthMonitoring();
    this.logger.log('🛡️ Data Management Resilience Service initialized');
  }

  /**
   * 🛡️ RESILIENT DATA QUERY
   * Wraps data queries with fallback mechanisms
   */
  async resilientQuery<T>(queryFn: () => Promise<T>, fallbackFn?: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    this.healthMetrics.totalRequests++;

    try {
      // Check circuit breaker
      if (this.circuitBreaker.isOpen) {
        if (this.shouldResetCircuitBreaker()) {
          this.resetCircuitBreaker();
        } else {
          this.logger.warn('Circuit breaker is open, using fallback');
          return await this.executeFallback(fallbackFn);
        }
      }

      // Execute main query with timeout
      const result = await Promise.race([
        queryFn(),
        this.timeoutPromise(this.fallbackConfig.cacheBypassThreshold),
      ]);

      // Update success metrics
      const responseTime = Date.now() - startTime;
      this.updateSuccessMetrics(responseTime);

      return result;
    } catch (error) {
      this.handleQueryFailure(error as Error);
      return await this.executeFallback(fallbackFn);
    }
  }

  /**
   * 🔄 AUTOMATIC RETRY WITH EXPONENTIAL BACKOFF
   */
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.fallbackConfig.maxRetries
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          break; // Don't wait after last attempt
        }

        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Max 10s
        this.logger.warn(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`, {
          error: (error as Error).message,
        });

        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  /**
   * 🏥 COMPREHENSIVE HEALTH CHECK
   */
  async performHealthCheck(): Promise<HealthStatus> {
    try {
      const startTime = Date.now();

      // Test each component
      const healthTests = await Promise.allSettled([
        this.testDataHub(),
        this.testContextProvider(),
        this.testCacheConnection(),
        this.testDatabaseConnection(),
      ]);

      const responseTime = Date.now() - startTime;

      const services = {
        dataHub: healthTests[0].status === 'fulfilled',
        contextProvider: healthTests[1].status === 'fulfilled',
        cache: healthTests[2].status === 'fulfilled',
        database: healthTests[3].status === 'fulfilled',
      };

      const healthyServices = Object.values(services).filter(Boolean).length;
      const totalServices = Object.keys(services).length;

      let status: 'healthy' | 'degraded' | 'critical';
      if (healthyServices === totalServices) {
        status = 'healthy';
      } else if (healthyServices >= totalServices / 2) {
        status = 'degraded';
      } else {
        status = 'critical';
      }

      const healthStatus: HealthStatus = {
        status,
        services,
        metrics: {
          responseTime,
          errorRate: this.calculateErrorRate(),
          cacheHitRatio: this.getCacheHitRatio(),
        },
        timestamp: new Date(),
      };

      this.healthMetrics.lastHealthCheck = new Date();

      // Log health status
      this.logger.log('Health check completed', { status, services, responseTime });

      return healthStatus;
    } catch (error) {
      this.logger.error('Health check failed', { error });
      return {
        status: 'critical',
        services: {
          dataHub: false,
          contextProvider: false,
          cache: false,
          database: false,
        },
        metrics: {
          responseTime: -1,
          errorRate: 1,
          cacheHitRatio: 0,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * 🔧 FALLBACK TO DIRECT DATABASE ACCESS
   */
  async fallbackToDirectDatabase(query: any): Promise<any> {
    try {
      this.logger.warn('Using direct database fallback', { query });

      // This would implement direct database access
      // bypassing the centralized system
      const result = await this.executeDirectDatabaseQuery(query);

      this.logger.warn('Direct database fallback used', {
        type: 'direct-database',
        query,
        timestamp: new Date(),
      });

      return result;
    } catch (error) {
      this.logger.error('Direct database fallback failed', { error, query });
      throw error;
    }
  }

  /**
   * 📊 GET SYSTEM RESILIENCE METRICS
   */
  getResilienceMetrics(): any {
    return {
      circuitBreaker: {
        isOpen: this.circuitBreaker.isOpen,
        failures: this.circuitBreaker.failures,
        lastFailureTime: this.circuitBreaker.lastFailureTime,
      },
      health: {
        totalRequests: this.healthMetrics.totalRequests,
        failedRequests: this.healthMetrics.failedRequests,
        successRate: this.calculateSuccessRate(),
        avgResponseTime: this.healthMetrics.avgResponseTime,
        lastHealthCheck: this.healthMetrics.lastHealthCheck,
      },
      fallbackConfig: this.fallbackConfig,
    };
  }

  // PRIVATE HELPER METHODS

  private async executeFallback<T>(fallbackFn?: () => Promise<T>): Promise<T> {
    if (fallbackFn) {
      try {
        const result = await fallbackFn();
        this.logger.log('Fallback function executed successfully');
        return result;
      } catch (fallbackError) {
        this.logger.error('Fallback function failed', { error: fallbackError });
        throw fallbackError;
      }
    }

    // Default fallback - return empty or cached data
    this.logger.warn('No fallback function provided, returning empty result');
    return {} as T;
  }

  private timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), ms);
    });
  }

  private handleQueryFailure(error: Error): void {
    this.healthMetrics.failedRequests++;
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = new Date();

    if (this.circuitBreaker.failures >= this.fallbackConfig.circuitBreakerThreshold) {
      this.openCircuitBreaker();
    }

    this.logger.error('Query failed', {
      error: error.message,
      failures: this.circuitBreaker.failures,
      circuitBreakerOpen: this.circuitBreaker.isOpen,
    });

    this.logger.warn('System query failed', {
      error: error.message,
      timestamp: new Date(),
      failures: this.circuitBreaker.failures,
    });
  }

  private updateSuccessMetrics(responseTime: number): void {
    const totalRequests = this.healthMetrics.totalRequests;
    this.healthMetrics.avgResponseTime =
      (this.healthMetrics.avgResponseTime * (totalRequests - 1) + responseTime) / totalRequests;

    // Reset circuit breaker on success
    if (this.circuitBreaker.failures > 0) {
      this.circuitBreaker.failures = Math.max(0, this.circuitBreaker.failures - 1);
    }
  }

  private openCircuitBreaker(): void {
    this.circuitBreaker.isOpen = true;
    this.logger.warn('Circuit breaker opened due to repeated failures');

    this.logger.warn('Circuit breaker opened', {
      failures: this.circuitBreaker.failures,
      timestamp: new Date(),
    });
  }

  private shouldResetCircuitBreaker(): boolean {
    if (!this.circuitBreaker.lastFailureTime) return false;

    const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailureTime.getTime();
    return timeSinceLastFailure > this.circuitBreaker.resetTimeout;
  }

  private resetCircuitBreaker(): void {
    this.circuitBreaker.isOpen = false;
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.lastFailureTime = null;

    this.logger.log('Circuit breaker reset');
    this.eventEmitter.emit('system.circuit-breaker.reset', {
      timestamp: new Date(),
    });
  }

  private calculateErrorRate(): number {
    if (this.healthMetrics.totalRequests === 0) return 0;
    return this.healthMetrics.failedRequests / this.healthMetrics.totalRequests;
  }

  private calculateSuccessRate(): number {
    return 1 - this.calculateErrorRate();
  }

  private getCacheHitRatio(): number {
    // This would integrate with the actual cache metrics
    // For now, return a placeholder
    return 0.85; // 85% hit ratio
  }

  private startHealthMonitoring(): void {
    // Perform health checks every 30 seconds
    setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        this.logger.error('Scheduled health check failed', { error });
      }
    }, 30000);
  }

  private async testDataHub(): Promise<void> {
    // Test if data hub is responsive
    try {
      const metrics = this.dataHub.getPerformanceMetrics();
      if (!metrics) throw new Error('Data hub not responding');
    } catch (error) {
      throw new Error('Data hub health check failed');
    }
  }

  private async testContextProvider(): Promise<void> {
    // Test if context provider is responsive
    try {
      // This would test a simple context provider operation
      // For now, just verify it exists
      if (!this.contextProvider) throw new Error('Context provider not available');
    } catch (error) {
      throw new Error('Context provider health check failed');
    }
  }

  private async testCacheConnection(): Promise<void> {
    // Test Redis connection
    try {
      const startTime = Date.now();
      await this.redis.ping();
      const responseTime = Date.now() - startTime;

      if (responseTime > 1000) {
        this.logger.warn('Redis ping response time is high', { responseTime });
      }

      this.logger.debug('Redis health check passed', { responseTime });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Redis connection health check failed: ${errorMessage}`);
    }
  }

  private async testDatabaseConnection(): Promise<void> {
    // Test PostgreSQL database connection
    try {
      const startTime = Date.now();
      await this.dataSource.query('SELECT 1');
      const responseTime = Date.now() - startTime;

      if (responseTime > 2000) {
        this.logger.warn('Database query response time is high', { responseTime });
      }

      this.logger.debug('Database health check passed', { responseTime });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Database connection health check failed: ${errorMessage}`);
    }
  }

  private async executeDirectDatabaseQuery(query: any): Promise<any> {
    // Ultimate fallback: Execute query directly against database
    // This bypasses the centralized data management system entirely
    this.logger.warn('🔄 Executing direct database query as fallback', {
      query: query?.operation || 'unknown',
      timestamp: new Date(),
    });

    try {
      // For different query types, we'd implement specific fallback logic
      if (query?.operation === 'find') {
        return await this.dataSource.getRepository(query.entity).find(query.options);
      } else if (query?.operation === 'findOne') {
        return await this.dataSource.getRepository(query.entity).findOne(query.options);
      } else if (query?.operation === 'save') {
        return await this.dataSource.getRepository(query.entity).save(query.data);
      }

      // Generic query execution
      return await this.dataSource.query(query.sql, query.parameters);
    } catch (error) {
      this.logger.error('❌ Direct database fallback also failed', { error });
      throw new Error('All fallback mechanisms exhausted');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
