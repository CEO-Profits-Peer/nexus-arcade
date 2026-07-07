/* Nexus Arcade — Service Worker
   Strategie: network-first (Online-First), Offline-Fallback aus Cache.
   Hält den Vercel-Deploy-Flow (immer frisch), macht die Seite aber
   installierbar (PWA) und offline-tolerant für den App-Shell. */
const VERSION = "nx-v1";
const SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.svg"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase & CDN durchreichen

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.ok && (req.destination === "document" || req.destination === "script" || req.destination === "style" || req.destination === "image")) {
          const clone = res.clone();
          caches.open(VERSION).then((c) => c.put(req, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("/")))
  );
});
