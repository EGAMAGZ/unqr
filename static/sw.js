const CACHE_NAME = "unqr-v1";
const STATIC_ASSETS = [
  "/",
  "/favicon.ico",
  "/manifest.json",
  "/styles.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(
          STATIC_ASSETS.map((url) =>
            cache.add(url).catch((error) => {
              console.warn(`Failed to cache ${url}:`, error);
            })
          ),
        );
      }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME && caches.delete(key)))
    ),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then(async (response) => {
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone();
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, responseToCache);
        }
        return response;
      })
      .catch(async (error) => {
        console.warn("Fetch failed, falling back to cache:", error);

        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        if (event.request.mode === "navigate") {
          const cache = await caches.open(CACHE_NAME);
          return cache.match("/");
        }

        return new Response("Offline - No cached version available", {
          status: 503,
          statusText: "Service Unavailable",
        });
      }),
  );
});
