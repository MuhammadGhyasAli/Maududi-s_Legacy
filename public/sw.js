const CACHE = "maududi-v2";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/logo.png",
  "/favicon.ico",
  "/icons/icon-192x192.svg",
  "/icons/icon-512x512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle http(s) requests. Skip unsupported schemes like
  // chrome-extension, data, blob, etc. that cannot be cached.
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return;
  }

  // API requests: network-first with timeout fallback to cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirstWithTimeout(request));
    return;
  }

  // Static assets: cache-first
  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font"
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation: network-first
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      return new Response(
        "<!DOCTYPE html><html><head><title>Offline</title><meta name='viewport' content='width=device-width,initial-scale=1'><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0a0a0a;color:#e5e7eb;text-align:center;padding:1rem}div{max-width:24rem}h1{font-size:1.5rem;margin-bottom:0.5rem}p{color:#9ca3af;font-size:0.875rem}</style></head><body><div><h1>You're offline</h1><p>Please check your connection and try again.</p></div></body></html>",
        { headers: { "Content-Type": "text/html;charset=UTF-8" } }
      );
    }
    throw error;
  }
}

async function networkFirstWithTimeout(request, timeoutMs = 3000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), timeoutMs)
  );
  try {
    const response = await Promise.race([fetch(request), timeout]);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: "Offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}
