const CACHE_NAME = "the-arena-v2";
const API_HOST = "api.thearena.lk";

// Core app shell pages to precache on install.
// Keep this list minimal: only public routes belong here. Auth-protected
// routes (e.g. /bookings, /profile) are intentionally excluded so SW
// installs do not waste server CPU on pages that immediately redirect.
const PRECACHE_URLS = ["/"];

// ── Install: precache app shell ──────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: purge stale caches ─────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Push Notification Handlers ────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: 'TheArena.lk', body: event.data.text() };
  }

  const title = data.title || 'TheArena.lk';
  const options = {
    body: data.body || '',
    icon: '/android-chrome-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || data.type || 'arena-notification',
    data: { action_url: data.action_url || '/' },
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.action_url) || '/';
  const fullUrl = new URL(url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === fullUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});

// ── Fetch: routing strategy ───────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== "GET") return;

  // 1. API calls → always network, never cache
  if (url.hostname === API_HOST || url.pathname.startsWith("/api/")) return;

  // 2. Next.js HMR / dev traffic → skip
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // 3. Static assets (_next/static, images, fonts) → cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(png|jpe?g|svg|ico|webp|gif|woff2?|ttf|otf)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // 4. Navigation requests → stale-while-revalidate.
  // Returning PWA users get an instant cache hit; we refresh the cache
  // in the background so the next visit is up to date. This avoids
  // hitting the origin (and Vercel functions) on every in-app navigation.
  if (request.mode === "navigate") {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached || caches.match("/"));

        // Serve cache immediately if we have it; otherwise wait for network.
        return cached || networkFetch;
      })
    );
    return;
  }
});
