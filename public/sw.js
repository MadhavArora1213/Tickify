// Service Worker for Tickify
// Provides caching and offline support for improved performance

const CACHE_NAME = 'tickify-v1';
const STATIC_CACHE = 'tickify-static-v1';
const DYNAMIC_CACHE = 'tickify-dynamic-v1';
const IMAGE_CACHE = 'tickify-images-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/vite.svg'
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first, then network
  cacheFirst: async (request, cacheName) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      return new Response('Offline', { status: 503 });
    }
  },
  
  // Network first, then cache
  networkFirst: async (request, cacheName) => {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      return cachedResponse || new Response('Offline', { status: 503 });
    }
  },
  
  // Stale while revalidate
  staleWhileRevalidate: async (request, cacheName) => {
    const cache = await caches.open(cacheName);
    const cachedResponse = await caches.match(request);
    
    const networkResponsePromise = fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    }).catch(() => cachedResponse);
    
    return cachedResponse || networkResponsePromise;
  }
};

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== STATIC_CACHE && 
                   cacheName !== DYNAMIC_CACHE && 
                   cacheName !== IMAGE_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests (except images)
  if (url.origin !== self.location.origin) {
    // Cache external images
    if (request.destination === 'image') {
      event.respondWith(
        CACHE_STRATEGIES.cacheFirst(request, IMAGE_CACHE)
      );
    }
    return;
  }
  
  // Handle different asset types
  if (request.destination === 'image') {
    // Images: Cache first
    event.respondWith(
      CACHE_STRATEGIES.cacheFirst(request, IMAGE_CACHE)
    );
  } else if (
    url.pathname.endsWith('.js') || 
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2')
  ) {
    // Static assets: Stale while revalidate
    event.respondWith(
      CACHE_STRATEGIES.staleWhileRevalidate(request, STATIC_CACHE)
    );
  } else if (url.pathname.startsWith('/api/')) {
    // API calls: Network first
    event.respondWith(
      CACHE_STRATEGIES.networkFirst(request, DYNAMIC_CACHE)
    );
  } else {
    // HTML pages: Network first
    event.respondWith(
      CACHE_STRATEGIES.networkFirst(request, DYNAMIC_CACHE)
    );
  }
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncBookings());
  }
});

async function syncBookings() {
  // Implement background sync logic for failed booking attempts
  console.log('[SW] Syncing bookings...');
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: data.url,
    actions: [
      { action: 'view', title: 'View' },
      { action: 'close', title: 'Close' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view' && event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
  
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

console.log('[SW] Service worker loaded');
