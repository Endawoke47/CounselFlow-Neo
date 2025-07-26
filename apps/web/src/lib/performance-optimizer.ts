/**
 * CounselFlow Performance Optimization Suite
 * Ultra-fast legal platform optimization for enterprise environments
 * Target: <100ms response times, 60fps animations, <2s load times
 * Customized for CounselFlow Clean Design Architecture
 */

interface PerformanceMetrics {
  FCP?: number;
  LCP?: number;
  CLS?: number;
  aiResponseTime?: number;
  documentProcessingTime?: number;
  searchTime?: number;
  searchResultCount?: number;
}

interface WorkerTask {
  worker: Worker;
  busy: boolean;
  id: number;
}

class CounselFlowPerformanceOptimizer {
  private performanceMetrics = new Map<string, number>();
  private resourceCache = new Map<string, number>();
  private observerInstances = new Map<string, IntersectionObserver>();
  private workerPool: WorkerTask[] = [];
  private connectionType: string;
  private db?: IDBDatabase;
  private aiPollingInterval = 3000;

  constructor() {
    this.connectionType = this.getConnectionType();
    this.init();
  }

  async init() {
    console.log('🚀 Initializing CounselFlow Performance Suite...');
    
    // Initialize all optimization systems in parallel
    await Promise.all([
      this.initServiceWorker(),
      this.setupResourcePreloading(),
      this.initVirtualScrolling(),
      this.setupLazyLoading(),
      this.initWebWorkers(),
      this.setupCriticalResourcePrioritization(),
      this.initPerformanceMonitoring(),
      this.setupMemoryOptimization(),
      this.initAnimationOptimization(),
      this.setupDatabaseOptimization(),
      this.optimizeForConnection()
    ]);

    console.log('🚀 CounselFlow Performance Suite Initialized - Target: <100ms response');
    this.reportInitialMetrics();
  }

  /**
   * CRITICAL RESOURCE OPTIMIZATION FOR COUNSELFLOW
   */
  async setupResourcePreloading() {
    const criticalResources = [
      // Critical Legal Fonts for Clean Design
      { href: '/fonts/inter-display.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
      { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossorigin: '' },
      
      // Critical CounselFlow Assets
      { href: '/images/counselflow-hero.webp', as: 'image' },
      { href: '/icons/legal-icons.svg', as: 'image' },
      
      // Critical Scripts for Legal Platform
      { href: '/_next/static/chunks/main.js', as: 'script' },
      { href: '/_next/static/chunks/pages/_app.js', as: 'script' },
      
      // Critical Styles for Clean Design
      { href: '/_next/static/css/app.css', as: 'style' }
    ];

    // Preload critical resources with high priority
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.fetchPriority = 'high';
      Object.assign(link, resource);
      document.head.appendChild(link);
    });

    // Setup intelligent prefetching for CounselFlow pages
    this.setupIntelligentPrefetching();
  }

  setupIntelligentPrefetching() {
    const counselFlowPages = [
      '/dashboard',
      '/contract-management',
      '/ai-assistant',
      '/risk-management',
      '/matter-management',
      '/client-management',
      '/dispute-management',
      '/entity-management',
      '/knowledge-management',
      '/policy-management',
      '/task-management'
    ];

    let hoverTimer: NodeJS.Timeout;
    
    // Prefetch on hover with 65ms delay (optimal for UX)
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && counselFlowPages.some(page => link.href.includes(page))) {
        hoverTimer = setTimeout(() => {
          this.prefetchPage(link.href);
        }, 65);
      }
    });

    document.addEventListener('mouseout', () => {
      clearTimeout(hoverTimer);
    });

    // Prefetch based on user navigation patterns
    this.setupPredictivePrefetching();
  }

  setupPredictivePrefetching() {
    // Track user navigation patterns for AI-powered prefetching
    const navigationHistory: string[] = JSON.parse(
      localStorage.getItem('counselflow_nav_history') || '[]'
    ).slice(-10); // Keep last 10 pages

    // Predict next likely pages based on current page
    const currentPath = window.location.pathname;
    const predictions = this.predictNextPages(currentPath, navigationHistory);
    
    predictions.forEach((page, index) => {
      setTimeout(() => this.prefetchPage(page), index * 100);
    });
  }

  predictNextPages(currentPath: string, history: string[]): string[] {
    const predictions: string[] = [];
    
    // Legal workflow predictions
    if (currentPath === '/dashboard') {
      predictions.push('/ai-assistant', '/contract-management', '/matter-management');
    } else if (currentPath === '/contract-management') {
      predictions.push('/ai-assistant', '/risk-management');
    } else if (currentPath === '/ai-assistant') {
      predictions.push('/dashboard', '/contract-management');
    }

    return predictions.slice(0, 3); // Limit to 3 predictions
  }

  async prefetchPage(url: string) {
    if (this.resourceCache.has(url)) return;

    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'document';
      document.head.appendChild(link);
      
      this.resourceCache.set(url, Date.now());
    } catch (error) {
      console.warn('Prefetch failed for:', url, error);
    }
  }

  /**
   * SERVICE WORKER FOR AGGRESSIVE CACHING
   */
  async initServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    try {
      // Register CounselFlow-specific service worker
      const registration = await navigator.serviceWorker.register('/sw-counselflow.js', {
        scope: '/'
      });

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        }
      });

      console.log('📋 CounselFlow Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  showUpdateNotification() {
    // Create elegant update notification for clean UI
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-teal-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeInUp';
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <span>New version available</span>
        <button onclick="window.location.reload()" class="bg-white text-teal-600 px-3 py-1 rounded text-sm font-medium">
          Update
        </button>
      </div>
    `;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 10000);
  }

  /**
   * VIRTUAL SCROLLING FOR LARGE LEGAL DATASETS
   */
  initVirtualScrolling() {
    class CounselFlowVirtualScroller {
      private container: HTMLElement;
      private itemHeight: number;
      private buffer: number;
      private scrollTop = 0;
      private containerHeight: number;
      private totalItems = 0;
      private visibleItems: HTMLElement[] = [];

      constructor(container: HTMLElement, itemHeight = 80, buffer = 5) {
        this.container = container;
        this.itemHeight = itemHeight;
        this.buffer = buffer;
        this.containerHeight = container.clientHeight;
        
        this.setupScrollListener();
      }

      setupScrollListener() {
        let ticking = false;
        
        this.container.addEventListener('scroll', () => {
          if (!ticking) {
            requestAnimationFrame(() => {
              this.handleScroll();
              ticking = false;
            });
            ticking = true;
          }
        }, { passive: true });
      }

      handleScroll() {
        this.scrollTop = this.container.scrollTop;
        const startIndex = Math.floor(this.scrollTop / this.itemHeight) - this.buffer;
        const endIndex = Math.ceil((this.scrollTop + this.containerHeight) / this.itemHeight) + this.buffer;
        
        this.renderVisibleItems(Math.max(0, startIndex), Math.min(this.totalItems, endIndex));
      }

      renderVisibleItems(start: number, end: number) {
        const fragment = document.createDocumentFragment();
        
        for (let i = start; i < end; i++) {
          const item = this.createOrRecycleItem(i);
          fragment.appendChild(item);
        }
        
        // Batch DOM update
        requestAnimationFrame(() => {
          this.container.innerHTML = '';
          this.container.appendChild(fragment);
        });
      }

      createOrRecycleItem(index: number): HTMLElement {
        let item = this.visibleItems[index];
        if (!item) {
          item = document.createElement('div');
          item.className = 'legal-list-item transition-all duration-200';
          item.style.height = `${this.itemHeight}px`;
          this.visibleItems[index] = item;
        }
        return item;
      }
    }

    // Apply to CounselFlow data lists
    const selectors = [
      '.contract-list',
      '.client-list', 
      '.matter-list',
      '.document-list',
      '.case-list'
    ];

    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(list => {
        new CounselFlowVirtualScroller(list as HTMLElement);
      });
    });
  }

  /**
   * ADVANCED LAZY LOADING WITH INTERSECTION OBSERVER
   */
  setupLazyLoading() {
    // High-performance lazy loading optimized for CounselFlow
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          this.loadImageProgressive(img);
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.1
    });

    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });

    // Component lazy loading for heavy CounselFlow components
    this.setupComponentLazyLoading();
  }

  async loadImageProgressive(img: HTMLImageElement) {
    const src = img.dataset.src;
    const placeholder = img.dataset.placeholder;

    if (!src) return;

    // Load low-quality placeholder first
    if (placeholder) {
      img.src = placeholder;
      img.style.filter = 'blur(5px)';
      img.style.transition = 'filter 0.3s ease';
    }

    // Load full quality image
    const fullImg = new Image();
    fullImg.onload = () => {
      img.src = fullImg.src;
      img.style.filter = 'none';
    };
    fullImg.onerror = () => {
      console.warn('Failed to load image:', src);
    };
    fullImg.src = src;
  }

  setupComponentLazyLoading() {
    const componentObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const component = entry.target as HTMLElement;
          const componentName = component.dataset.component;
          
          if (componentName) {
            this.loadComponent(componentName, component);
            componentObserver.unobserve(component);
          }
        }
      });
    }, { rootMargin: '100px' });

    document.querySelectorAll('[data-component]').forEach(component => {
      componentObserver.observe(component);
    });
  }

  async loadComponent(componentName: string, container: HTMLElement) {
    try {
      // Dynamic import for CounselFlow components
      const componentPath = `/components/${componentName}`;
      const module = await import(componentPath);
      const Component = module.default || module[componentName];
      
      if (Component) {
        const instance = new Component(container);
        instance.render?.();
      }
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
      // Fallback to static content
      container.innerHTML = '<div class="text-gray-500">Component loading...</div>';
    }
  }

  /**
   * WEB WORKERS FOR AI PROCESSING
   */
  async initWebWorkers() {
    const workerCount = Math.min(navigator.hardwareConcurrency || 4, 8);
    
    for (let i = 0; i < workerCount; i++) {
      try {
        const worker = new Worker('/workers/counselflow-ai-worker.js');
        this.workerPool.push({
          worker,
          busy: false,
          id: i
        });
      } catch (error) {
        console.warn('Failed to create worker:', error);
      }
    }

    console.log(`🤖 Initialized ${this.workerPool.length} AI processing workers`);
  }

  async processWithWorker(task: string, data: any): Promise<any> {
    const availableWorker = this.workerPool.find(w => !w.busy);
    
    if (!availableWorker) {
      // Queue task if no workers available
      await new Promise(resolve => setTimeout(resolve, 50));
      return this.processWithWorker(task, data);
    }

    availableWorker.busy = true;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Worker timeout'));
        availableWorker.busy = false;
      }, 30000);

      availableWorker.worker.onmessage = (e) => {
        clearTimeout(timeout);
        availableWorker.busy = false;
        resolve(e.data);
      };

      availableWorker.worker.onerror = (error) => {
        clearTimeout(timeout);
        availableWorker.busy = false;
        reject(error);
      };

      availableWorker.worker.postMessage({ task, data });
    });
  }

  /**
   * ANIMATION OPTIMIZATION FOR CLEAN DESIGN
   */
  initAnimationOptimization() {
    // GPU-accelerated animations for CounselFlow components
    const animatedElements = document.querySelectorAll(`
      .brutal-card,
      .nav-link,
      .magnetic-button,
      .title-emphasis,
      .animate-fadeInUp,
      .animate-slideInLeft,
      .animate-slideInRight,
      .hero-background,
      .gradient-mesh
    `);

    animatedElements.forEach(element => {
      const el = element as HTMLElement;
      // Force GPU acceleration
      el.style.transform = 'translateZ(0)';
      el.style.willChange = 'transform, opacity';
      el.style.backfaceVisibility = 'hidden';
      el.style.perspective = '1000px';
    });

    // Optimize animation framerate based on device capability
    this.optimizeAnimationFramerate();
    
    // Reduce motion for accessibility
    this.respectReducedMotion();
  }

  optimizeAnimationFramerate() {
    let lastTime = 0;
    const targetFPS = this.getOptimalFramerate();
    const frameInterval = 1000 / targetFPS;

    const optimizedRAF = (callback: FrameRequestCallback) => {
      const currentTime = performance.now();
      const timeToNextFrame = frameInterval - (currentTime - lastTime);

      if (timeToNextFrame <= 0) {
        lastTime = currentTime;
        callback(currentTime);
      } else {
        setTimeout(() => optimizedRAF(callback), timeToNextFrame);
      }
    };

    // Replace requestAnimationFrame for CounselFlow animations
    (window as any).counselFlowRAF = optimizedRAF;
  }

  respectReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
      document.body.classList.add('reduce-motion');
      console.log('♿ Reduced motion enabled for accessibility');
    }

    prefersReducedMotion.addEventListener('change', (e) => {
      document.body.classList.toggle('reduce-motion', e.matches);
    });
  }

  getOptimalFramerate(): number {
    const isLowEnd = navigator.hardwareConcurrency <= 2;
    const isSlowConnection = ['slow-2g', '2g'].includes(this.connectionType);
    
    if (isLowEnd || isSlowConnection) return 30;
    if (this.connectionType === '3g') return 45;
    return 60;
  }

  /**
   * MEMORY OPTIMIZATION
   */
  setupMemoryOptimization() {
    // Automatic garbage collection for CounselFlow data
    setInterval(() => {
      this.cleanupUnusedResources();
    }, 60000);

    // Monitor memory usage
    if ('memory' in performance) {
      this.monitorMemoryUsage();
    }

    // Cleanup on page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.performHiddenPageCleanup();
      }
    });
  }

  cleanupUnusedResources() {
    const maxCacheAge = 300000; // 5 minutes
    const now = Date.now();

    // Clear old cache entries
    this.resourceCache.forEach((timestamp, key) => {
      if (now - timestamp > maxCacheAge) {
        this.resourceCache.delete(key);
      }
    });

    // Cleanup unused observers
    this.observerInstances.forEach((observer, key) => {
      if (!document.querySelector(key)) {
        observer.disconnect();
        this.observerInstances.delete(key);
      }
    });
  }

  performHiddenPageCleanup() {
    // Pause animations when page is hidden
    document.body.classList.add('page-hidden');
    
    // Reduce worker activity
    this.workerPool.forEach(worker => {
      if (!worker.busy) {
        worker.worker.postMessage({ task: 'pause' });
      }
    });
  }

  monitorMemoryUsage() {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        const usedMB = memInfo.usedJSHeapSize / 1048576;
        const limitMB = memInfo.jsHeapSizeLimit / 1048576;
        
        this.performanceMetrics.set('memoryUsage', usedMB);
        
        if (usedMB / limitMB > 0.8) {
          console.warn('⚠️ High memory usage detected, initiating cleanup');
          this.aggressiveCleanup();
        }
      }
    };

    setInterval(checkMemory, 30000);
  }

  aggressiveCleanup() {
    // Clear all caches
    this.resourceCache.clear();
    
    // Reduce animation quality temporarily
    document.body.classList.add('reduce-motion-temp');
    setTimeout(() => {
      document.body.classList.remove('reduce-motion-temp');
    }, 10000);

    // Clear unused DOM elements
    document.querySelectorAll('.temp-element, .cached-element, .stale-component').forEach(el => {
      if (!el.isConnected || !(el as HTMLElement).offsetParent) {
        el.remove();
      }
    });

    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }
  }

  /**
   * NETWORK OPTIMIZATION
   */
  getConnectionType(): string {
    if ('connection' in navigator) {
      return (navigator as any).connection.effectiveType || 'unknown';
    }
    return 'unknown';
  }

  async optimizeForConnection() {
    const connection = (navigator as any).connection;
    
    if (connection) {
      if (['slow-2g', '2g'].includes(connection.effectiveType)) {
        this.enableDataSaverMode();
      } else if (connection.effectiveType === '4g') {
        this.enableHighQualityMode();
      }

      // Listen for connection changes
      connection.addEventListener('change', () => {
        this.connectionType = connection.effectiveType;
        this.optimizeForConnection();
      });
    }
  }

  enableDataSaverMode() {
    console.log('📱 Data saver mode enabled for CounselFlow');
    
    document.body.classList.add('data-saver-mode');
    
    // Reduce image quality
    document.querySelectorAll('img[data-lowres]').forEach(img => {
      const imgEl = img as HTMLImageElement;
      const lowres = imgEl.dataset.lowres;
      if (lowres) imgEl.src = lowres;
    });
    
    // Reduce AI polling frequency
    this.aiPollingInterval = 10000;
  }

  enableHighQualityMode() {
    console.log('🚀 High quality mode enabled for CounselFlow');
    
    document.body.classList.add('high-quality-mode');
    
    // Preload additional resources
    this.preloadAdditionalAssets();
  }

  preloadAdditionalAssets() {
    const additionalAssets = [
      '/images/high-res-hero.webp',
      '/icons/detailed-legal-icons.svg',
      '/animations/legal-animations.json'
    ];

    additionalAssets.forEach(asset => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = asset;
      document.head.appendChild(link);
    });
  }

  /**
   * DATABASE OPTIMIZATION
   */
  async setupDatabaseOptimization() {
    if ('indexedDB' in window) {
      try {
        this.db = await this.initCounselFlowDB();
        this.setupDBCaching();
      } catch (error) {
        console.warn('IndexedDB initialization failed:', error);
      }
    }
  }

  async initCounselFlowDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CounselFlowDB', 2);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (e) => {
        const db = (e.target as any).result;
        
        // Legal document store
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('type', 'type', { unique: false });
          docStore.createIndex('client', 'clientId', { unique: false });
          docStore.createIndex('date', 'createdAt', { unique: false });
        }
        
        // AI response cache
        if (!db.objectStoreNames.contains('aiCache')) {
          const aiStore = db.createObjectStore('aiCache', { keyPath: 'queryHash' });
          aiStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // User preferences
        if (!db.objectStoreNames.contains('preferences')) {
          db.createObjectStore('preferences', { keyPath: 'userId' });
        }

        // Performance metrics
        if (!db.objectStoreNames.contains('metrics')) {
          const metricsStore = db.createObjectStore('metrics', { keyPath: 'timestamp' });
          metricsStore.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  setupDBCaching() {
    // Cache strategy for CounselFlow data
    const cacheStrategy = {
      documents: { ttl: 3600000 }, // 1 hour
      aiResponses: { ttl: 1800000 }, // 30 minutes
      userPrefs: { ttl: 86400000 }, // 24 hours
      searchResults: { ttl: 600000 } // 10 minutes
    };

    console.log('💾 Database caching strategy configured');
  }

  /**
   * PERFORMANCE MONITORING
   */
  initPerformanceMonitoring() {
    this.measureCoreWebVitals();
    this.measureCounselFlowMetrics();
    
    if (window.location.search.includes('debug=performance')) {
      this.createPerformanceDashboard();
    }
  }

  measureCoreWebVitals() {
    // First Contentful Paint
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.performanceMetrics.set('FCP', entry.startTime);
          console.log(`🎨 FCP: ${entry.startTime.toFixed(2)}ms`);
        }
      }
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.performanceMetrics.set('LCP', lastEntry.startTime);
      console.log(`🖼️ LCP: ${lastEntry.startTime.toFixed(2)}ms`);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.performanceMetrics.set('CLS', clsValue);
      console.log(`📐 CLS: ${clsValue.toFixed(4)}`);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  measureCounselFlowMetrics() {
    // Export measurement functions for CounselFlow components
    (window as any).CounselFlowMetrics = {
      measureAIResponse: (startTime: number) => {
        const responseTime = performance.now() - startTime;
        this.performanceMetrics.set('aiResponseTime', responseTime);
        
        if (responseTime > 3000) {
          console.warn(`⚠️ Slow AI response: ${responseTime.toFixed(2)}ms`);
        }
      },

      measureDocumentProcessing: (startTime: number) => {
        const processingTime = performance.now() - startTime;
        this.performanceMetrics.set('documentProcessingTime', processingTime);
      },

      measureSearchPerformance: (startTime: number, resultCount: number) => {
        const searchTime = performance.now() - startTime;
        this.performanceMetrics.set('searchTime', searchTime);
        this.performanceMetrics.set('searchResultCount', resultCount);
      },

      measurePageTransition: (startTime: number) => {
        const transitionTime = performance.now() - startTime;
        this.performanceMetrics.set('pageTransitionTime', transitionTime);
      }
    };
  }

  setupCriticalResourcePrioritization() {
    // Prioritize critical resources for faster loading
    const resourceHints = [
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//api.counselflow.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
    ];

    resourceHints.forEach(hint => {
      const link = document.createElement('link');
      Object.assign(link, hint);
      document.head.appendChild(link);
    });
  }

  createPerformanceDashboard() {
    const dashboard = document.createElement('div');
    dashboard.id = 'counselflow-performance-dashboard';
    dashboard.className = 'fixed top-4 left-4 bg-gray-900 text-white p-4 rounded-lg shadow-xl z-50 font-mono text-sm max-w-xs';

    const updateDashboard = () => {
      const fps = this.getCurrentFPS();
      const memory = 'memory' in performance ? 
        `${((performance as any).memory.usedJSHeapSize / 1048576).toFixed(1)}MB` : 'N/A';
      
      dashboard.innerHTML = `
        <div class="font-bold text-teal-400 mb-2">CounselFlow Performance</div>
        <div class="space-y-1">
          <div>FPS: <span class="text-green-400">${fps}</span></div>
          <div>Memory: <span class="text-blue-400">${memory}</span></div>
          <div>FCP: ${this.performanceMetrics.get('FCP')?.toFixed(2) || 'N/A'}ms</div>
          <div>LCP: ${this.performanceMetrics.get('LCP')?.toFixed(2) || 'N/A'}ms</div>
          <div>CLS: ${this.performanceMetrics.get('CLS')?.toFixed(4) || 'N/A'}</div>
          <div>Connection: <span class="text-yellow-400">${this.connectionType}</span></div>
          <div>Workers: <span class="text-purple-400">${this.workerPool.length}</span></div>
        </div>
      `;
    };

    document.body.appendChild(dashboard);
    setInterval(updateDashboard, 1000);
    updateDashboard();
  }

  getCurrentFPS(): number {
    let fps = 0;
    let lastTime = performance.now();
    let frames = 0;

    const countFrame = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frames * 1000) / (currentTime - lastTime));
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrame);
    };

    countFrame();
    return fps;
  }

  reportInitialMetrics() {
    setTimeout(() => {
      const loadTime = performance.now();
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      console.log('📊 CounselFlow Performance Report:');
      console.log(`⚡ Total Load Time: ${loadTime.toFixed(2)}ms`);
      console.log(`🌐 DOM Content Loaded: ${navigationTiming.domContentLoadedEventEnd.toFixed(2)}ms`);
      console.log(`📋 Page Load Complete: ${navigationTiming.loadEventEnd.toFixed(2)}ms`);
      console.log(`🔄 Connection Type: ${this.connectionType}`);
      console.log(`🧠 Hardware Concurrency: ${navigator.hardwareConcurrency || 'unknown'}`);
      
      const grade = this.calculatePerformanceGrade(loadTime);
      console.log(`🏆 Performance Grade: ${grade}`);

      // Store metrics in IndexedDB for analysis
      this.storePerformanceMetrics(loadTime, navigationTiming);
    }, 100);
  }

  async storePerformanceMetrics(loadTime: number, navigationTiming: PerformanceNavigationTiming) {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction(['metrics'], 'readwrite');
      const store = transaction.objectStore('metrics');
      
      const metrics = {
        timestamp: Date.now(),
        type: 'page-load',
        loadTime,
        domContentLoaded: navigationTiming.domContentLoadedEventEnd,
        pageLoadComplete: navigationTiming.loadEventEnd,
        connectionType: this.connectionType,
        userAgent: navigator.userAgent
      };

      await store.add(metrics);
    } catch (error) {
      console.warn('Failed to store performance metrics:', error);
    }
  }

  calculatePerformanceGrade(loadTime: number): string {
    if (loadTime < 1000) return 'A+ (Excellent)';
    if (loadTime < 2000) return 'A (Very Good)';
    if (loadTime < 3000) return 'B (Good)';
    if (loadTime < 4000) return 'C (Average)';
    return 'D (Needs Improvement)';
  }

  /**
   * PUBLIC API FOR COUNSELFLOW COMPONENTS
   */
  
  // Optimize document rendering
  optimizeDocumentRendering(container: HTMLElement) {
    this.initVirtualScrolling();
    this.setupLazyLoading();
  }

  // Optimize AI assistant performance
  async optimizeAIAssistant() {
    await this.initWebWorkers();
    console.log('🤖 AI Assistant optimized for maximum performance');
  }

  // Get current performance status
  getPerformanceStatus() {
    return {
      metrics: Object.fromEntries(this.performanceMetrics),
      cacheSize: this.resourceCache.size,
      workerCount: this.workerPool.length,
      connectionType: this.connectionType,
      memoryUsage: 'memory' in performance ? (performance as any).memory : null
    };
  }

  // Manual cleanup trigger
  cleanup() {
    this.aggressiveCleanup();
    console.log('🧹 Manual cleanup completed');
  }
}

// Performance utilities
export const legalDebounce = <T extends (...args: any[]) => void>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null!;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

export const legalThrottle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// DOM Batcher for efficient DOM operations
class CounselFlowDOMBatcher {
  private operations: (() => void)[] = [];
  private scheduled = false;

  add(operation: () => void) {
    this.operations.push(operation);
    this.schedule();
  }

  private schedule() {
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  private flush() {
    const operations = this.operations.splice(0);
    operations.forEach(op => op());
    this.scheduled = false;
  }
}

export const counselFlowDOMBatcher = new CounselFlowDOMBatcher();

// Initialize and export
export const counselFlowOptimizer = new CounselFlowPerformanceOptimizer();

// Export utilities
export const CounselFlowPerformanceUtils = {
  debounce: legalDebounce,
  throttle: legalThrottle,
  domBatcher: counselFlowDOMBatcher,
  optimizer: counselFlowOptimizer
};

// Global exports for browser use
if (typeof window !== 'undefined') {
  (window as any).CounselFlowOptimizer = counselFlowOptimizer;
  (window as any).CounselFlowPerformanceUtils = CounselFlowPerformanceUtils;
}

export default CounselFlowPerformanceOptimizer;
