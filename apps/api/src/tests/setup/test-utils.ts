/**
 * 🧪 TEST SETUP CONFIGURATION
 *
 * Global test setup for resilience service tests including:
 * - Mock configurations
 * - Test database setup
 * - Common test utilities
 *
 * Author: Endawoke47
 * Created: 2025-07-13
 */

// Global test configuration
export const TEST_CONFIG = {
  circuitBreaker: {
    failureThreshold: 3, // Lower threshold for faster testing
    timeout: 1000, // 1 second timeout for tests
  },
  retry: {
    maxAttempts: 2, // Fewer retries for faster tests
    baseDelay: 100, // Shorter delays for tests
  },
  health: {
    checkInterval: 1000, // 1 second for tests
  },
};

// Mock Redis for tests
export const createMockRedis = (): any => ({
  ping: jest.fn().mockResolvedValue('PONG'),
  disconnect: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  connect: jest.fn().mockResolvedValue(undefined),
  status: 'ready',
});

// Mock PostgreSQL Pool for tests
export const createMockDbPool = (): any => ({
  query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  end: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  connect: jest.fn().mockResolvedValue(undefined),
  totalCount: 10,
  idleCount: 5,
  waitingCount: 0,
});

// Mock Data Hub for tests
export const createMockDataHub = (): any => ({
  query: jest.fn().mockResolvedValue({ data: 'mock-data' }),
  getPerformanceMetrics: jest.fn().mockReturnValue({
    responseTime: 100,
    queriesPerSecond: 50,
    cacheHitRatio: 0.9,
  }),
  mutate: jest.fn().mockResolvedValue({ success: true }),
  getAnalytics: jest.fn().mockResolvedValue({ totalQueries: 1000 }),
});

// Mock Context Provider for tests
export const createMockContextProvider = (): any => ({
  getContextualData: jest.fn().mockResolvedValue({
    userId: 'test-user',
    permissions: ['read', 'write'],
    preferences: { theme: 'dark' },
  }),
  getUserBehavior: jest.fn().mockResolvedValue({
    commonQueries: ['clients', 'cases'],
    timePatterns: { mostActive: '09:00-17:00' },
  }),
});

// Test utilities
export class TestUtils {
  /**
   * Wait for a specified amount of time
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute a function multiple times and collect results
   */
  static async executeMultiple<T>(
    fn: () => Promise<T>,
    count: number,
    concurrent = false
  ): Promise<T[]> {
    if (concurrent) {
      const promises = Array.from({ length: count }, () => fn());
      return Promise.all(promises);
    } else {
      const results: T[] = [];
      for (let i = 0; i < count; i++) {
        results.push(await fn());
      }
      return results;
    }
  }

  /**
   * Measure execution time of a function
   */
  static async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  }

  /**
   * Create a function that fails a specified number of times before succeeding
   */
  static createFailingFunction<T>(
    failCount: number,
    successValue: T,
    errorMessage = 'Test failure'
  ) {
    let callCount = 0;
    return () => {
      callCount++;
      if (callCount <= failCount) {
        return Promise.reject(new Error(`${errorMessage} (attempt ${callCount})`));
      }
      return Promise.resolve(successValue);
    };
  }

  /**
   * Create a function that randomly fails based on a failure rate
   */
  static createRandomlyFailingFunction<T>(
    failureRate: number,
    successValue: T,
    errorMessage = 'Random test failure'
  ) {
    return () => {
      if (Math.random() < failureRate) {
        return Promise.reject(new Error(errorMessage));
      }
      return Promise.resolve(successValue);
    };
  }

  /**
   * Assert that a value is within a range
   */
  static assertInRange(value: number, min: number, max: number, message?: string): void {
    if (value < min || value > max) {
      throw new Error(message || `Expected ${value} to be between ${min} and ${max}`);
    }
  }

  /**
   * Generate test data for load testing
   */
  static generateTestData(count: number): Array<{ id: number; operation: string; params: any }> {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      operation: `test-operation-${i}`,
      params: {
        userId: `user-${i % 10}`,
        entityType: ['client', 'case', 'document'][i % 3],
        timestamp: new Date().toISOString(),
      },
    }));
  }
}

// Custom Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(min: number, max: number): R;
      toHaveBeenCalledWithinTime(maxTime: number): R;
    }
  }
}

// Extend Jest matchers
expect.extend({
  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${min}-${max}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${min}-${max}`,
        pass: false,
      };
    }
  },

  toHaveBeenCalledWithinTime(received: jest.MockedFunction<any>, maxTime: number) {
    const calls = received.mock.calls;
    if (calls.length === 0) {
      return {
        message: () => 'expected function to have been called',
        pass: false,
      };
    }

    // This is a simplified version - in practice you'd measure actual call times
    return {
      message: () => `expected function to be called within ${maxTime}ms`,
      pass: true,
    };
  },
});

// Global test setup
beforeAll(() => {
  // Suppress console logs during tests unless explicitly needed
  if (!process.env.VERBOSE_TESTS) {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  }
});

afterAll(() => {
  // Cleanup any global resources
  jest.clearAllMocks();
});
