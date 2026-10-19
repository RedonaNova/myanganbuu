/* Мянганбуу service worker
 * - Inquiry push notifications (admin).
 * - Offline support for showing work on a weak connection:
 *     photos (/media)       cache first, capped, never change once uploaded
 *     build assets          cache first (file names are content hashes)
 *     public pages          network first with a short timeout, cache fallback
 *   Admin, API and quote pages are never cached.
 */
const VERSION = "v1";
const PAGES = `mb-pages-${VERSION}`;
const STATIC = `mb-static-${VERSION}`;
const MEDIA = "mb-media"; // photo URLs are immutable, so no version
const MEDIA_LIMIT = 600;
const NETWORK_TIMEOUT_MS = 3500;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((c) => c.add("/uzuulekh"))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("mb-") && ![PAGES, STATIC, MEDIA].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const p = url.pathname;
  if (p.startsWith("/admin") || p.startsWith("/api") || p.startsWith("/une") || p === "/sw.js") return;

  if (p.startsWith("/media/")) return event.respondWith(cacheFirst(req, MEDIA, true));
  if (p.startsWith("/_next/static/") || p.startsWith("/_next/image")) return event.respondWith(cacheFirst(req, STATIC));
  if (req.mode === "navigate" || req.headers.get("RSC") === "1") return event.respondWith(networkFirst(req));
});

async function cacheFirst(req, cacheName, trim) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req, { ignoreVary: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) {
    await cache.put(req, res.clone());
    if (trim) trimCache(cache);
  }
  return res;
}

async function networkFirst(req) {
  const cache = await caches.open(PAGES);
  // RSC payloads and HTML for the same URL must not overwrite each other.
  const key = req.headers.get("RSC") === "1" ? new Request(req.url + (req.url.includes("?") ? "&" : "?") + "__rsc") : req;
  try {
    const res = await Promise.race([
      fetch(req),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), NETWORK_TIMEOUT_MS)),
    ]);
    if (res.ok) cache.put(key, res.clone());
    return res;
  } catch {
    const hit = (await cache.match(key, { ignoreVary: true })) || (req.mode === "navigate" && (await cache.match("/uzuulekh")));
    return hit || Response.error();
  }
}

let trimming = false;
async function trimCache(cache) {
  if (trimming) return;
  trimming = true;
  try {
    const keys = await cache.keys();
    // Oldest first: cache.keys() keeps insertion order.
    for (let i = 0; i < keys.length - MEDIA_LIMIT; i++) await cache.delete(keys[i]);
  } finally {
    trimming = false;
  }
}

// ─── Push notifications ──────────────────────────────────────────────────

self.addEventListener("push", (event) => {
  let data = { title: "Мянганбуу", body: "", url: "/admin/inquiries" };
  try {
    data = { ...data, ...event.data.json() };
  } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/badge-72.png",
      data: { url: data.url },
      tag: data.url,
      renotify: true,
      vibrate: [120, 60, 120],
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/admin", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      const open = wins.find((w) => w.url.startsWith(self.location.origin + "/admin"));
      if (open) return open.focus().then((w) => w.navigate(url));
      return self.clients.openWindow(url);
    }),
  );
});
