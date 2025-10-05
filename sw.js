/**
 * Yearify Service Worker
 * Provides basic caching for offline functionality
 */

const CACHE_NAME = "yearify-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./src/styles/theme.css",
  "./src/styles/layout.css",
  "./src/styles/components.css",
  "./src/styles/responsive.css",
  "./src/app.js",
  "./src/components/theme-manager.js",
  "./src/components/progress-tracker.js",
  "./src/components/milestone-manager.js",
  "./src/components/ui-controls.js",
  "./src/utils/date-utils.js",
  "./src/data/quotes.js",
];

// Install Service Worker
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error("Failed to cache resources:", error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, return a basic offline page
        if (event.request.destination === "document") {
          return new Response(
            `<!DOCTYPE html>
            <html>
            <head>
              <title>Yearify - Offline</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  padding: 50px; 
                  background: #181c20; 
                  color: #fff; 
                }
                .offline-message {
                  max-width: 400px;
                  margin: 0 auto;
                  padding: 2rem;
                  background: #23272f;
                  border-radius: 12px;
                  border: 1px solid #444;
                }
              </style>
            </head>
            <body>
              <div class="offline-message">
                <h1>🔌 You're Offline</h1>
                <p>Yearify requires an internet connection to function properly.</p>
                <p>Please check your connection and try again.</p>
                <button onclick="window.location.reload()">Retry</button>
              </div>
            </body>
            </html>`,
            {
              headers: { "Content-Type": "text/html" },
            }
          );
        }
      })
  );
});

// Activate Service Worker
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

console.log("Service Worker loaded successfully");
