// Performance initialization script
// This runs as early as possible to optimize loading

(function() {
  'use strict';

  // Critical performance optimizations that need to run immediately
  const criticalOptimizations = {
    // Preconnect to critical origins
    preconnectToCriticalOrigins() {
      const origins = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
      ];

      origins.forEach(origin => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        link.crossOrigin = '';
        document.head.appendChild(link);
      });
    },

    // DNS prefetch for performance
    setupDNSPrefetch() {
      const domains = [
        '//api.counselflow.com',
        '//cdn.counselflow.com'
      ];

      domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        document.head.appendChild(link);
      });
    },

    // Early resource hints
    setupResourceHints() {
      // Preload critical CSS
      const criticalCSS = document.createElement('link');
      criticalCSS.rel = 'preload';
      criticalCSS.as = 'style';
      criticalCSS.href = '/_next/static/css/app.css';
      document.head.appendChild(criticalCSS);

      // Preload critical fonts
      const fonts = [
        '/fonts/inter-display.woff2',
        '/fonts/inter.woff2'
      ];

      fonts.forEach(font => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = 'font/woff2';
        link.href = font;
        link.crossOrigin = '';
        document.head.appendChild(link);
      });
    },

    // Optimize viewport
    optimizeViewport() {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
      }
    },

    // Early connection detection
    detectConnection() {
      if ('connection' in navigator) {
        const connection = navigator.connection;
        const effectiveType = connection.effectiveType;
        
        // Add connection class to body for CSS optimization
        document.documentElement.className += ` connection-${effectiveType}`;
        
        // Store for later use
        window.counselFlowConnection = effectiveType;
      }
    },

    // Early motion preference detection
    detectMotionPreference() {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      if (prefersReducedMotion.matches) {
        document.documentElement.className += ' reduce-motion-preferred';
      }

      // Listen for changes
      prefersReducedMotion.addEventListener('change', (e) => {
        if (e.matches) {
          document.documentElement.className += ' reduce-motion-preferred';
        } else {
          document.documentElement.className = document.documentElement.className.replace(' reduce-motion-preferred', '');
        }
      });
    },

    // Early performance monitoring
    startPerformanceMonitoring() {
      if ('performance' in window && 'getEntriesByType' in performance) {
        // Mark navigation start
        performance.mark('counselflow-init-start');

        // Monitor First Contentful Paint
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              console.log(`🎨 CounselFlow FCP: ${entry.startTime.toFixed(2)}ms`);
              
              // Set performance grade class
              const grade = entry.startTime < 1000 ? 'performance-excellent' :
                           entry.startTime < 2000 ? 'performance-good' :
                           entry.startTime < 3000 ? 'performance-average' : 'performance-poor';
              
              document.documentElement.className += ` ${grade}`;
            }
          }
        });

        try {
          observer.observe({ entryTypes: ['paint'] });
        } catch (e) {
          console.warn('Performance Observer not fully supported');
        }
      }
    },

    // Optimize critical rendering path
    optimizeCriticalPath() {
      // Inline critical CSS for above-the-fold content
      const criticalCSS = `
        .critical-content {
          contain: layout style paint;
          transform: translateZ(0);
        }
        
        .above-fold {
          will-change: transform, opacity;
          contain: layout style paint;
        }
        
        .hw-accelerated {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `;

      const style = document.createElement('style');
      style.textContent = criticalCSS;
      document.head.appendChild(style);
    },

    // Initialize feature detection
    detectFeatures() {
      const features = {
        webp: false,
        avif: false,
        intersectionObserver: 'IntersectionObserver' in window,
        requestIdleCallback: 'requestIdleCallback' in window,
        serviceWorker: 'serviceWorker' in navigator,
        webgl: false
      };

      // Test WebP support
      const webp = new Image();
      webp.onload = webp.onerror = () => {
        features.webp = webp.height === 2;
        if (features.webp) {
          document.documentElement.className += ' webp-supported';
        }
      };
      webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';

      // Test AVIF support
      const avif = new Image();
      avif.onload = avif.onerror = () => {
        features.avif = avif.height === 2;
        if (features.avif) {
          document.documentElement.className += ' avif-supported';
        }
      };
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=';

      // Test WebGL support
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        features.webgl = !!gl;
        if (features.webgl) {
          document.documentElement.className += ' webgl-supported';
        }
      } catch (e) {
        features.webgl = false;
      }

      // Store features for later use
      window.counselFlowFeatures = features;
    }
  };

  // Run critical optimizations immediately
  criticalOptimizations.detectConnection();
  criticalOptimizations.detectMotionPreference();
  criticalOptimizations.optimizeViewport();
  criticalOptimizations.optimizeCriticalPath();
  criticalOptimizations.startPerformanceMonitoring();

  // Run remaining optimizations when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      criticalOptimizations.preconnectToCriticalOrigins();
      criticalOptimizations.setupDNSPrefetch();
      criticalOptimizations.setupResourceHints();
      criticalOptimizations.detectFeatures();
    });
  } else {
    criticalOptimizations.preconnectToCriticalOrigins();
    criticalOptimizations.setupDNSPrefetch();
    criticalOptimizations.setupResourceHints();
    criticalOptimizations.detectFeatures();
  }

  // Performance reporting
  window.addEventListener('load', () => {
    performance.mark('counselflow-init-end');
    
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0];
      const loadTime = performance.now();
      
      console.log('🚀 CounselFlow Performance Report:');
      console.log(`⚡ Total Load Time: ${loadTime.toFixed(2)}ms`);
      console.log(`🌐 DOM Content Loaded: ${navigation.domContentLoadedEventEnd.toFixed(2)}ms`);
      console.log(`📋 Page Load Complete: ${navigation.loadEventEnd.toFixed(2)}ms`);
      
      // Store metrics
      window.counselFlowInitialMetrics = {
        loadTime,
        domContentLoaded: navigation.domContentLoadedEventEnd,
        pageLoadComplete: navigation.loadEventEnd,
        connection: window.counselFlowConnection || 'unknown'
      };
    }
  });

  // Global error handling for performance
  window.addEventListener('error', (e) => {
    console.error('Performance Error:', e.error);
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('Performance Promise Rejection:', e.reason);
  });

})();
      webp: boolean;
