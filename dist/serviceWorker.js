const CACHE_NAME = 'vault-pwa-v3';

// Install event - cache everything aggressively
self.addEventListener('install', (event) => {
  console.log('Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app shell...');
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json'
      ]);
    }).then(() => {
      console.log('App shell cached successfully');
    }).catch(err => {
      console.log('Cache failed:', err);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache first, then network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('Serving from cache:', event.request.url);
        return cachedResponse;
      }

      console.log('Fetching from network:', event.request.url);
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache the response
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
          console.log('Cached:', event.request.url);
        });

        return response;
      }).catch(() => {
        console.log('Network failed, trying cache for:', event.request.url);
        // If network fails, try to serve index.html for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        throw new Error('Network failed and no cache available');
      });
    })
  );
});



self.addEventListener('sync', (event) => {
  if (event.tag === 'vault-sync') {
    event.waitUntil(syncVaultData());
  }
});

async function syncVaultData() {
  // Sync data between devices on same network
  try {
    const data = localStorage.getItem('vault_data');
    if (data) {
      // Broadcast to other devices on local network
      const response = await fetch('/api/sync', {
        method: 'POST',
        body: data
      });
    }
  } catch (error) {
    console.log('Sync failed, will retry later');
  }
}