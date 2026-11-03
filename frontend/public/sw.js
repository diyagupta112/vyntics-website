// Offline fallback only. Caches the offline page and serves it when a page navigation fails because the network is unreachable.
// Everything else (API calls, _next assets, images, video, auth, non-GET) goes straight to the network untouched.
const CACHE = "vyntics-offline-v1";
const PRECACHE = ["/offline.html", "/images/vyntics-mark-transparent.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.mode !== "navigate" || request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // Network first. Only a thrown fetch (no connection) falls back; HTTP responses such as 404 or 500 pass through unchanged.
  event.respondWith(
    fetch(request).catch(async () => (await caches.match("/offline.html")) || Response.error()),
  );
});
