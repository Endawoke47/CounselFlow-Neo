/**
 * 🛡️ RESILIENCE AND RELIABILITY ENHANCEMENTS (Express.js Version)
 * 
 * This service adds built-in redundancy, fallback mechanisms, 
 * and health checks to the centralized data management system.
 * 
 * Author: Endawoke47
 * Created: 2025-07-13
 */

import Redis from 'ioredis';
import { Pool } from 'pg';
import { logger } from '../config/logger';
import { DataManagementHubService } from './data-management-hub.service';
import { DataContextProviderService } from './data-context-provider.service';

interface HealthStatus {
  isHealthy: boolean;
  lastCheck: Date;
  responseTime: number;
  errors: string[];
}

interface CircuitBreakerState {
  isOpen: boolean;
  failures: number;
  lastFailure: Date | null;
  successCount: number;
}

interface SystemMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  lastHealthCheck: Date;
}

export class DataManagementResilienceService {
  private readonly logger = logger.child({ service: 'DataManagementResilience' });
  
  // Circuit breaker configuration
  private readonly FAILURE_THRESHOLD = 5;
  private readonly RESET_TIMEOUT = 60000; // 1 minute
  private readonly RETRY_DELAY = 1000; // 1 second
  private readonly MAX_RETRIES = 3;

  // Component health status
  private hubHealth: HealthStatus = {
    isHealthy: true,
    lastCheck: new Date(),
    responseTime: 0,
    errors: []
  };

  private contextProviderHealth: HealthStatus = {
    isHealthy: true,
    lastCheck: new Date(),
    responseTime: 0,
    errors: []
  };

  private circuitBreaker: CircuitBreakerState = {
    isOpen: false,
    failures: 0,
    lastFailure: null,
    successCount: 0
  };

  private systemMetrics: SystemMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    avgResponseTime: 0,
    lastHealthCheck: new Date()
  };

  constructor(
    private dataHub: DataManagementHubService,
    private contextProvider: DataContextProviderService,
    private redis: Redis,
    private dbPool: Pool,
  ) {
    this.startHealthMonitoring();
    this.logger.info('🛡️ Data Management Resilience Service initialized');
  }

  /**
   * 🛡️ RESILIENT DATA QUERY
   * Wraps data queries with fallback mechanisms
   */
  async resilientQuery(operation: string, params: any): Promise<any> {
    const startTime = Date.now();
    this.systemMetrics.totalRequests++;

    try {
      // Check circuit breaker
      if (this.circuitBreaker.isOpen) {
        return await this.executeWithFallback(operation, params);
      }

      // Attempt primary query through data hub
      const result = await this.executeWithRetry(
        () => this.dataHub.query(operation, params)
      );

      // Success - record metrics and reset circuit breaker
      this.recordSuccess(Date.now() - startTime);
      return result;

    } catch (error) {
      this.recordFailure();
      this.logger.warn('Primary query failed, attempting fallback', { 
        operation, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      return await this.executeWithFallback(operation, params);
    }
  }

  /**
   * 🔄 RETRY MECHANISM
   * Executes operation with exponential backoff
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.MAX_RETRIES
  ): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === retries) throw error;
        
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        this.logger.debug(`Retry attempt ${attempt}/${retries} after ${delay}ms`, {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        await this.delay(delay);
      }
    }
    throw new Error('Max retries exceeded');
  }

  /**
   * 🚨 FALLBACK EXECUTION
   * Attempts context provider, then direct database
   */
  private async executeWithFallback(operation: string, params: any): Promise<any> {
    try {
      // First fallback: Context Provider
      this.logger.info('🔄 Attempting Context Provider fallback');
      const result = await this.contextProvider.getContextualData(params);
      this.logger.info('✅ Context Provider fallback successful');
      return result;
      
    } catch (contextError) {
      this.logger.warn('Context Provider fallback failed', { 
        error: contextError instanceof Error ? contextError.message : 'Unknown error' 
      });
      
      try {
        // Final fallback: Direct Database
        this.logger.info('🔄 Attempting direct database fallback');
        const result = await this.executeDirectDatabaseQuery({ operation, ...params });
        this.logger.info('✅ Direct database fallback successful');
        return result;
        
      } catch (dbError) {
        this.logger.error('❌ All fallback mechanisms failed', { 
          error: dbError instanceof Error ? dbError.message : 'Unknown error' 
        });
        throw new Error('All data access methods failed');
      }
    }
  }

  /**
   * 📊 PERFORMANCE MONITORING
   */
  getSystemHealth(): any {
    return {
      circuitBreaker: this.circuitBreaker,
      hubHealth: this.hubHealth,
      contextProviderHealth: this.contextProviderHealth,
      metrics: this.systemMetrics,
      cacheHitRatio: this.calculateCacheHitRatio(),
      uptime: process.uptime()
    };
  }

  /**
   * 🔧 MANUAL CIRCUIT BREAKER CONTROLS
   */
  async resetCircuitBreaker(): Promise<void> {
    this.circuitBreaker.isOpen = false;
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.successCount = 0;
    this.circuitBreaker.lastFailure = null;
    
    this.logger.info('🔄 Circuit breaker manually reset');
  }

  async forceHealthCheck(): Promise<any> {
    return await this.performHealthCheck();
  }

  /**
   * 🔒 PRIVATE METHODS
   */
  private recordSuccess(responseTime: number): void {
    this.systemMetrics.successfulRequests++;
    this.systemMetrics.avgResponseTime = 
      (this.systemMetrics.avgResponseTime + responseTime) / 2;
    
    this.circuitBreaker.successCount++;
    
    // Reset circuit breaker after successful operations
    if (this.circuitBreaker.successCount >= 3) {
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failures = 0;
    }
  }

  private recordFailure(): void {
    this.systemMetrics.failedRequests++;
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = new Date();
    this.circuitBreaker.successCount = 0;
    
    // Open circuit breaker if threshold exceeded
    if (this.circuitBreaker.failures >= this.FAILURE_THRESHOLD) {
      this.openCircuitBreaker();
    }
  }

  private openCircuitBreaker(): void {
    this.circuitBreaker.isOpen = true;
    this.logger.warn('Circuit breaker opened due to repeated failures');
    
    this.logger.warn('Circuit breaker opened', {
      failures: this.circuitBreaker.failures,
      timestamp: new Date()
    });

    // Auto-reset after timeout
    setTimeout(() => {
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failures = 0;
      this.logger.info('Circuit breaker auto-reset after timeout');
    }, this.RESET_TIMEOUT);
  }

  private async performHealthCheck(): Promise<any> {
    const healthCheck = {
      timestamp: new Date(),
      hub: { healthy: false, responseTime: 0, error: null as string | null },
      contextProvider: { healthy: false, responseTime: 0, error: null as string | null },
      redis: { healthy: false, responseTime: 0, error: null as string | null },
      database: { healthy: false, responseTime: 0, error: null as string | null }
    };

    // Test Data Hub
    try {
      await this.testDataHub();
      healthCheck.hub.healthy = true;
    } catch (error) {
      healthCheck.hub.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test Context Provider
    try {
      await this.testContextProvider();
      healthCheck.contextProvider.healthy = true;
    } catch (error) {
      healthCheck.contextProvider.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test Redis
    try {
      await this.testRedisConnection();
      healthCheck.redis.healthy = true;
    } catch (error) {
      healthCheck.redis.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test Database
    try {
      await this.testDatabaseConnection();
      healthCheck.database.healthy = true;
    } catch (error) {
      healthCheck.database.error = error instanceof Error ? error.message : 'Unknown error';
    }

    this.systemMetrics.lastHealthCheck = new Date();
    return healthCheck;
  }

  private calculateCacheHitRatio(): number {
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

  private async testRedisConnection(): Promise<void> {
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
      const client = await this.dbPool.connect();
      await client.query('SELECT 1');
      client.release();
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
      timestamp: new Date()
    });
    
    try {
      const client = await this.dbPool.connect();
      
      try {
        // For different query types, we'd implement specific fallback logic
        if (query?.operation === 'findUsers') {
          const result = await client.query('SELECT * FROM users WHERE $1', [query.filter]);
          return result.rows;
        } else if (query?.operation === 'findDocuments') {
          const result = await client.query('SELECT * FROM documents WHERE $1', [query.filter]);
          return result.rows;
        }
        
        // Generic query execution
        const result = await client.query(query.sql, query.parameters);
        return result.rows;
      } finally {
        client.release();
      }
    } catch (error) {
      this.logger.error('❌ Direct database fallback also failed', { error });
      throw new Error('All fallback mechanisms exhausted');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
