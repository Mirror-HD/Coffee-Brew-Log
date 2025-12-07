const CACHE_NAME = 'coffee-app-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://aistudiocdn.com/react@^19.2.1/',
  'https://aistudiocdn.com/react@^19.2.1',
  'https://aistudiocdn.com/recharts@^3.5.1',
  'https://aistudiocdn.com/@google/genai@^1.31.0',
  'https://aistudiocdn.com/lucide-react@^0.556.0',
  'https://aistudiocdn.com/react-dom@^19.2.1/'
];

// Install event: Cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches
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

// Fetch event: Serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  // Navigation requests (HTML) - Network First, fall back to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('./index.html');
        })
    );
    return;
  }

  // Asset requests - Cache First, fall back to network
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
          // Optionally cache new requests dynamically here
          return fetchResponse;
      });
    })
  );
});