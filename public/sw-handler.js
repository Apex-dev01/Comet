/**
 * Comet Edge Proxy (CEP) - Service Worker
 * Handles client-side request interception and proxying
 */

const CACHE_NAME = 'comet-cache-v1';
const PROXY_ENDPOINT = '/proxy/';

// Service Worker version
const SW_VERSION = '1.0.0';

console.log(`CEP Service Worker v${SW_VERSION} initializing...`);

/**
 * Install event - cache essential assets
 */
self.addEventListener('install', (event) => {
  console.log('CEP SW: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/cep.js',
        '/sw-handler',
      ]).catch(err => {
        console.warn('CEP SW: Failed to cache some assets', err);
      });
    })
  );
  
  // Force activation immediately
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('CEP SW: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

/**
 * Fetch event - intercept and proxy requests
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Don't intercept proxy requests (already proxied)
  if (url.pathname.startsWith(PROXY_ENDPOINT)) {
    return;
  }
  
  // Don't intercept same-origin requests for CEP assets
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
    return;
  }
  
  // For external requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version and update in background
        fetchAndCache(event.request);
        return cachedResponse;
      }
      
      // Not in cache, fetch and cache
      return fetchAndCache(event.request);
    })
  );
});

/**
 * Fetch and cache helper
 */
function fetchAndCache(request) {
  return fetch(request)
    .then((response) => {
      // Only cache successful responses
      if (!response || response.status !== 200 || response.type === 'error') {
        return response;
      }
      
      // Clone the response
      const responseToCache = response.clone();
      
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseToCache);
      });
      
      return response;
    })
    .catch((error) => {
      console.error('CEP SW: Fetch failed', error);
      throw error;
    });
}

/**
 * Message event - handle commands from clients
 */
self.addEventListener('message', (event) => {
  console.log('CEP SW: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: SW_VERSION });
  }
});

console.log('CEP Service Worker: Ready');
