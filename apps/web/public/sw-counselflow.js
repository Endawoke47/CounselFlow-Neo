/**
 * CounselFlow Service Worker
 * Aggressive caching strategy for legal platform optimization
 * Optimized for clean design and fast loading
 */

const CACHE_NAME = 'counselflow-v1.0.0';
const CACHE_VERSION = '1.0.0';

// Critical resources to cache immediately
const PRECACHE_URLS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/_next/static/css/app.css',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/pages/_app.js',
  '/fonts/inter-display.woff2',
  '/fonts/inter.woff2'
];

// Resources to cache on first visit
const RUNTIME_CACHE = [
  // API routes
  { pattern: /^\/api\//, strategy: 'networkFirst', cacheName: 'api-cache' },
  
  // Next.js static assets
  { pattern: /\/_next\/static\//, strategy: 'cacheFirst', cacheName: 'static-assets' },
  
  // Images
  { pattern: /\.(?:png|jpg|jpeg|svg|webp|gif)$/, strategy: 'cacheFirst', cacheName: 'images' },
  
  // Fonts
  { pattern: /\.(?:woff|woff2|otf|ttf)$/, strategy: 'cacheFirst', cacheName: 'fonts' },
  
  // Documents and pages
  { pattern: /^\/(?:contract-management|ai-assistant|dashboard|matter-management)/, strategy: 'networkFirst', cacheName: 'pages' }
];

// Cache strategies
const STRATEGIES = {
  cacheFirst: async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      console.error('Network request failed:', error);
      throw error;
    }
  },

  networkFirst: async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  },

  staleWhileRevalidate: async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    });
    
    return cachedResponse || fetchPromise;
  }
};

// Install event - precache critical resources
self.addEventListener('install', (event) => {
  console.log('CounselFlow Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Precaching critical CounselFlow resources');
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('CounselFlow Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('counselflow-')) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // Find matching cache strategy
  for (const rule of RUNTIME_CACHE) {
    if (rule.pattern.test(url.pathname) || rule.pattern.test(request.url)) {
      try {
        return await STRATEGIES[rule.strategy](request, rule.cacheName);
      } catch (error) {
        console.error('Cache strategy failed:', error);
        break;
      }
    }
  }

  // Default: try network first, fallback to cache
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback for pages
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }

    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  // Handle offline legal document uploads, AI queries, etc.
  console.log('Background sync triggered for CounselFlow');
  
  try {
    // Sync pending legal document uploads
    await syncPendingUploads();
    
    // Sync AI assistant queries
    await syncAIQueries();
    
    // Sync user preferences
    await syncUserPreferences();
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function syncPendingUploads() {
  // Implementation for syncing pending document uploads
  const uploads = await getStoredUploads();
  
  for (const upload of uploads) {
    try {
      await fetch('/api/documents/upload', {
        method: 'POST',
        body: upload.data
      });
      
      // Remove from storage after successful upload
      await removeStoredUpload(upload.id);
    } catch (error) {
      console.error('Upload sync failed:', error);
    }
  }
}

async function syncAIQueries() {
  // Implementation for syncing AI queries made while offline
  const queries = await getStoredAIQueries();
  
  for (const query of queries) {
    try {
      await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query.data)
      });
      
      await removeStoredAIQuery(query.id);
    } catch (error) {
      console.error('AI query sync failed:', error);
    }
  }
}

async function syncUserPreferences() {
  // Sync user preferences and settings
  const preferences = await getStoredPreferences();
  
  if (preferences) {
    try {
      await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });
      
      await clearStoredPreferences();
    } catch (error) {
      console.error('Preferences sync failed:', error);
    }
  }
}

// Utility functions for IndexedDB operations
async function getStoredUploads() {
  // Implementation would connect to IndexedDB and retrieve pending uploads
  return [];
}

async function removeStoredUpload(id) {
  // Remove uploaded item from IndexedDB
}

async function getStoredAIQueries() {
  // Get pending AI queries from IndexedDB
  return [];
}

async function removeStoredAIQuery(id) {
  // Remove processed AI query from IndexedDB
}

async function getStoredPreferences() {
  // Get user preferences from IndexedDB
  return null;
}

async function clearStoredPreferences() {
  // Clear synced preferences from IndexedDB
}

// Push notification handling for legal updates
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/counselflow-icon-192.png',
        badge: '/icons/counselflow-badge.png',
        tag: data.tag || 'counselflow-notification',
        requireInteraction: data.requireInteraction || false,
        actions: data.actions || []
      })
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If CounselFlow is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open CounselFlow
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data?.url || '/dashboard');
      }
    })
  );
});

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PERFORMANCE_METRICS') {
    // Log performance metrics from main thread
    console.log('Performance metrics received:', event.data.metrics);
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('CounselFlow Service Worker loaded successfully');
