/* AUTON Health Paciente — Service Worker
 * Bump CACHE_VERSION para invalidar caches antigos quando subir uma release. */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `auton-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `auton-runtime-${CACHE_VERSION}`;

/* Assets críticos do shell pré-cacheados (precarregados no install). */
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.png",
  "/auton-isologo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  // Ativa o novo SW imediatamente após instalar
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* Fetch strategy:
 *  - HTML / navegação      → network-first (fresh sempre que possível)
 *  - JS/CSS/img estáticos  → stale-while-revalidate
 *  - Outras origens (CDN)  → cache-first com fallback rede */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // Navegação SPA: network-first; fallback p/ index.html offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/index.html"))
        )
    );
    return;
  }

  // Assets same-origin: stale-while-revalidate
  if (isSameOrigin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetched = fetch(request)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || fetched;
      })
    );
    return;
  }

  // Cross-origin (CDN fonts, leaflet, etc.): cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((res) => {
          if (res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});

/* Permitir que o app force skipWaiting via postMessage. */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
