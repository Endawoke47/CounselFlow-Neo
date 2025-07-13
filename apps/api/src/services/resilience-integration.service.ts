/**
 * 🎯 RESILIENCE SERVICE INTEGRATION
 * 
 * Initializes and exports the complete resilience service with all dependencies
 * 
 * Author: Endawoke47
 * Created: 2025-07-13
 */

import { DataManagementResilienceService } from './data-management-resilience-express.service';
import { redis, dbPool } from '../config/database';
import { logger } from '../config/logger';

// Initialize services in correct order
let resilienceService: DataManagementResilienceService;

export async function initializeResilienceService(): Promise<DataManagementResilienceService> {
  try {
    logger.info('🔄 Initializing resilience service...');

    // First, check if services are already initialized
    if (resilienceService) {
      return resilienceService;
    }

    // Initialize base services (simplified Express.js versions)
    // These would normally be your existing services
    const dataHub = {
      query: async (operation: string, params?: any) => {
        // Mock implementation - replace with actual service
        logger.debug('Mock DataHub query', { operation, params });
        return { mockData: true, operation, params };
      },
      getPerformanceMetrics: () => ({
        responseTime: 150,
        queriesPerSecond: 45,
        cacheHitRatio: 0.85
      })
    } as any;

    const contextProvider = {
      getContextualData: async (params: any) => {
        // Mock implementation - replace with actual service
        logger.debug('Mock ContextProvider query', { params });
        return { mockContextData: true, params };
      }
    } as any;

    // Initialize resilience service with all dependencies
    resilienceService = new DataManagementResilienceService(
      dataHub,
      contextProvider,
      redis,
      dbPool
    );

    logger.info('✅ Resilience service initialized successfully');
    return resilienceService;

  } catch (error) {
    logger.error('❌ Failed to initialize resilience service:', error);
    throw error;
  }
}

export function getResilienceService(): DataManagementResilienceService {
  if (!resilienceService) {
    throw new Error('Resilience service not initialized. Call initializeResilienceService() first.');
  }
  return resilienceService;
}

// Export for convenience
export { DataManagementResilienceService } from './data-management-resilience-express.service';
