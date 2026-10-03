/* Anime Partner — offline service worker.
   Developed by Shin.

   Caches
     ap-shell-<ver>  app shell (index.html, manifest, icons) — replaced on update
     ap-images       remote cover art — deliberately NOT version-scoped, so an
                     app update never throws away the artwork the user chose to
                     download. AP.Offline writes into this same cache.

   Strategy
     shell   → cache-first, refreshed in the background (instant launch offline)
     images  → cache-first, then network, then an inline SVG placeholder
     API     → network-only, with a soft JSON fallback so nothing hangs
*/
const VERSION = "ap-v1.7.0";
const SHELL   = VERSION + "-shell";
const IMAGES  = "ap-images";          // shared with AP.Offline — do not rename
const MAX_IMAGES = 4000;              // room for the full 447-poster pack + browsing

const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-96.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-192.png",
  "./icon-maskable-512.png"
];

/* A tiny grey poster used when an image is missing and we are offline, so a
   card never collapses into a broken-image icon. */
const PLACEHOLDER = new Response(
  '<svg xmlns="http://www.w3.org/2000/svg" width="230" height="345" viewBox="0 0 230 345">' +
  '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0" stop-color="#241c33"/><stop offset="1" stop-color="#140f1f"/></linearGradient></defs>' +
  '<rect width="230" height="345" fill="url(#g)"/>' +
  '<text x="115" y="178" font-family="system-ui,sans-serif" font-size="42" fill="#5b4b78" text-anchor="middle">◍</text>' +
  '</svg>',
  { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" } }
);

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    // add files one by one: a single 404 must not fail the whole install
    await Promise.all(SHELL_FILES.map(f => c.add(f).catch(() => null)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => k !== IMAGES && k !== SHELL).map(k => caches.delete(k))
    );
    if (self.registration.navigationPreload) {
      try { await self.registration.navigationPreload.enable(); } catch (_) {}
    }
    await self.clients.claim();
  })());
});

async function trim(name, max) {
  try {
    const c = await caches.open(name);
    const keys = await c.keys();
    if (keys.length > max) {
      await Promise.all(keys.slice(0, keys.length - max).map(k => c.delete(k)));
    }
  } catch (_) {}
}

const isImage = (url) =>
  /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(url.pathname) ||
  url.hostname.indexOf("s4.anilist.co") !== -1;

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  /* ---- live data API: network only, never served stale ---- */
  if (url.hostname.indexOf("graphql.anilist.co") !== -1 ||
      url.hostname.indexOf("api.jikan.moe") !== -1) {
    e.respondWith(
      fetch(req).catch(() => new Response(
        JSON.stringify({ data: null, offline: true }),
        { headers: { "Content-Type": "application/json" } }
      ))
    );
    return;
  }

  /* ---- artwork: cache-first, then network, then placeholder ---- */
  if (isImage(url) && url.origin !== location.origin) {
    e.respondWith((async () => {
      const c = await caches.open(IMAGES);
      const hit = await c.match(req, { ignoreVary: true });
      if (hit) return hit;
      try {
        const res = await fetch(req, { mode: "cors", credentials: "omit" });
        if (res && res.ok && res.type !== "opaque") {
          c.put(req, res.clone()).then(() => trim(IMAGES, MAX_IMAGES)).catch(() => {});
        }
        return res;
      } catch (_) {
        return PLACEHOLDER.clone();
      }
    })());
    return;
  }

  /* ---- navigations: cache-first on the shell so launch is instant ---- */
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      const cached = await caches.match("./index.html");
      const net = fetch(req).then(res => {
        if (res && res.ok) caches.open(SHELL).then(c => c.put("./index.html", res.clone()));
        return res;
      }).catch(() => cached);
      return cached || net;
    })());
    return;
  }

  /* ---- everything else same-origin: cache-first + background refresh ---- */
  if (url.origin === location.origin) {
    e.respondWith((async () => {
      const hit = await caches.match(req);
      const net = fetch(req).then(res => {
        if (res && res.ok) caches.open(SHELL).then(c => c.put(req, res.clone()));
        return res;
      }).catch(() => hit);
      return hit || net;
    })());
  }
});

self.addEventListener("message", (e) => {
  if (e.data === "skipWaiting") self.skipWaiting();
});
