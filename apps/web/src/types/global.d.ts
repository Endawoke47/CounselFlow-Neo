// Global type declarations for CounselFlow-Neo
// This file extends the global window object with our custom properties

declare global {
  interface Window {
    CounselFlowOptimizer?: {
      getPerformanceStatus(): {
        aiResponseTime: number;
        documentProcessingTime: number;
        searchPerformanceTime: number;
        cacheHitRatio: number;
        memoryUsage: number;
        isOptimized: boolean;
      };
      cleanup(): void;
      init(): void;
    };
    
    CounselFlowMetrics?: {
      measureAIResponse(startTime: number): void;
      measureDocumentProcessing(startTime: number): void;
      measureSearchPerformance(startTime: number, resultCount: number): void;
      trackUserInteraction(action: string, target: string): void;
    };

    // Service Worker registration
    swRegistration?: ServiceWorkerRegistration;
    
    // Performance monitoring
    CounselFlowPerformance?: {
      startTime: number;
      loadTime: number;
      renderTime: number;
    };
  }

  // Environment variables
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_APP_URL: string;
      NEXT_PUBLIC_API_URL: string;
      NEXT_PUBLIC_AI_ENDPOINT: string;
      NEXT_PUBLIC_ENABLE_AI_FEATURES: string;
      NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: string;
      NEXT_PUBLIC_ENABLE_SERVICE_WORKER: string;
      NEXT_PUBLIC_DEBUG: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

// Export empty object to make this a module
export {};
