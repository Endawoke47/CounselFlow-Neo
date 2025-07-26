'use client';

import { useEffect, useCallback, useRef } from 'react';
import { counselFlowOptimizer, legalDebounce, legalThrottle } from '../lib/performance-optimizer';

export interface PerformanceMetrics {
  FCP?: number;
  LCP?: number;
  CLS?: number;
  memoryUsage?: number;
  connectionType?: string;
}

export function usePerformanceOptimization() {
  const metricsRef = useRef<PerformanceMetrics>({});

  // Measure AI response time
  const measureAIResponse = useCallback((startTime: number) => {
    const responseTime = performance.now() - startTime;
    
    if (window.CounselFlowMetrics) {
      window.CounselFlowMetrics.measureAIResponse(startTime);
    }
    
    return responseTime;
  }, []);

  // Measure document processing
  const measureDocumentProcessing = useCallback((startTime: number) => {
    const processingTime = performance.now() - startTime;
    
    if (window.CounselFlowMetrics) {
      window.CounselFlowMetrics.measureDocumentProcessing(startTime);
    }
    
    return processingTime;
  }, []);

  // Measure search performance
  const measureSearchPerformance = useCallback((startTime: number, resultCount: number) => {
    const searchTime = performance.now() - startTime;
    
    if (window.CounselFlowMetrics) {
      window.CounselFlowMetrics.measureSearchPerformance(startTime, resultCount);
    }
    
    return searchTime;
  }, []);

  // Get current performance status
  const getPerformanceStatus = useCallback(() => {
    if (window.CounselFlowOptimizer) {
      return window.CounselFlowOptimizer.getPerformanceStatus();
    }
    return null;
  }, []);

  // Optimize component for performance
  const optimizeComponent = useCallback((element: HTMLElement) => {
    if (!element) return;

    // Add GPU acceleration
    element.style.transform = 'translateZ(0)';
    element.style.willChange = 'transform, opacity';
    element.style.backfaceVisibility = 'hidden';
    
    // Add performance classes
    element.classList.add('gpu-accelerated');
  }, []);

  // Lazy load component
  const setupLazyLoading = useCallback((element: HTMLElement, callback: () => void) => {
    if (!element || !('IntersectionObserver' in window)) {
      callback();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
            observer.unobserve(element);
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // Debounced function creator
  const createDebouncedFunction = useCallback(<T extends (...args: any[]) => void>(
    fn: T,
    delay: number
  ) => {
    return legalDebounce(fn, delay);
  }, []);

  // Throttled function creator
  const createThrottledFunction = useCallback(<T extends (...args: any[]) => void>(
    fn: T,
    limit: number
  ) => {
    return legalThrottle(fn, limit);
  }, []);

  // Optimize images
  const optimizeImage = useCallback((img: HTMLImageElement, src: string, placeholder?: string) => {
    if (placeholder) {
      img.src = placeholder;
      img.style.filter = 'blur(5px)';
      img.style.transition = 'filter 0.3s ease';
    }

    const fullImg = new Image();
    fullImg.onload = () => {
      img.src = fullImg.src;
      img.style.filter = 'none';
      img.classList.add('loaded');
    };
    fullImg.src = src;
  }, []);

  // Memory cleanup
  const performCleanup = useCallback(() => {
    if (window.CounselFlowOptimizer) {
      window.CounselFlowOptimizer.cleanup();
    }
  }, []);

  // Check if user prefers reduced motion
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Adaptive loading based on connection
  const getConnectionType = useCallback(() => {
    if ('connection' in navigator) {
      return (navigator as any).connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }, []);

  // Update performance metrics
  useEffect(() => {
    const updateMetrics = () => {
      if (window.CounselFlowOptimizer) {
        metricsRef.current = window.CounselFlowOptimizer.getPerformanceStatus();
      }
    };

    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, []);

  return {
    // Measurement functions
    measureAIResponse,
    measureDocumentProcessing,
    measureSearchPerformance,
    
    // Optimization functions
    optimizeComponent,
    setupLazyLoading,
    optimizeImage,
    
    // Utility functions
    createDebouncedFunction,
    createThrottledFunction,
    performCleanup,
    
    // Status functions
    getPerformanceStatus,
    prefersReducedMotion,
    getConnectionType,
    
    // Current metrics
    metrics: metricsRef.current
  };
}

// Hook for AI operations performance
export function useAIPerformance() {
  const { measureAIResponse } = usePerformanceOptimization();

  const processWithAI = useCallback(async <T,>(
    aiFunction: () => Promise<T>,
    taskName?: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await aiFunction();
      const responseTime = measureAIResponse(startTime);
      
      console.log(`✅ AI ${taskName || 'operation'} completed in ${responseTime.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const responseTime = performance.now() - startTime;
      console.error(`❌ AI ${taskName || 'operation'} failed after ${responseTime.toFixed(2)}ms:`, error);
      throw error;
    }
  }, [measureAIResponse]);

  return { processWithAI };
}

// Hook for document operations performance
export function useDocumentPerformance() {
  const { measureDocumentProcessing } = usePerformanceOptimization();

  const processDocument = useCallback(async <T,>(
    processingFunction: () => Promise<T>,
    documentName?: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await processingFunction();
      const processingTime = measureDocumentProcessing(startTime);
      
      console.log(`📄 Document ${documentName || 'processing'} completed in ${processingTime.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const processingTime = performance.now() - startTime;
      console.error(`❌ Document ${documentName || 'processing'} failed after ${processingTime.toFixed(2)}ms:`, error);
      throw error;
    }
  }, [measureDocumentProcessing]);

  return { processDocument };
}

// Hook for search operations performance
export function useSearchPerformance() {
  const { measureSearchPerformance } = usePerformanceOptimization();

  const performSearch = useCallback(async <T extends { length?: number } | any[]>(
    searchFunction: () => Promise<T>,
    searchQuery?: string
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const results = await searchFunction();
      const resultCount = Array.isArray(results) 
        ? results.length 
        : results?.length || 0;
      
      const searchTime = measureSearchPerformance(startTime, resultCount);
      
      console.log(`🔍 Search ${searchQuery ? `"${searchQuery}"` : ''} completed in ${searchTime.toFixed(2)}ms with ${resultCount} results`);
      return results;
    } catch (error) {
      const searchTime = performance.now() - startTime;
      console.error(`❌ Search ${searchQuery ? `"${searchQuery}"` : ''} failed after ${searchTime.toFixed(2)}ms:`, error);
      throw error;
    }
  }, [measureSearchPerformance]);

  return { performSearch };
}

// Hook for adaptive rendering based on performance
export function useAdaptiveRendering() {
  const { getConnectionType, prefersReducedMotion, getPerformanceStatus } = usePerformanceOptimization();

  const shouldReduceAnimations = useCallback(() => {
    const connectionType = getConnectionType();
    const reducedMotion = prefersReducedMotion();
    const status = getPerformanceStatus();
    
    return (
      reducedMotion ||
      ['slow-2g', '2g'].includes(connectionType) ||
      (status?.memoryUsage && status.memoryUsage > 100) // 100MB threshold
    );
  }, [getConnectionType, prefersReducedMotion, getPerformanceStatus]);

  const shouldReduceQuality = useCallback(() => {
    const connectionType = getConnectionType();
    return ['slow-2g', '2g', '3g'].includes(connectionType);
  }, [getConnectionType]);

  const getOptimalImageQuality = useCallback(() => {
    const connectionType = getConnectionType();
    
    switch (connectionType) {
      case 'slow-2g':
      case '2g':
        return 'low';
      case '3g':
        return 'medium';
      case '4g':
      default:
        return 'high';
    }
  }, [getConnectionType]);

  return {
    shouldReduceAnimations,
    shouldReduceQuality,
    getOptimalImageQuality
  };
}
