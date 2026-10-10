const CACHE_NAME = "canspot-cache-v244";

const APP_SHELL = [
  "./",
  "./index.html",
  "./impressum.html",
  "./datenschutz.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon-180.png",
  "./icons/favicon-32.png",
  "./icons/favicon-16.png",
  "./lib/leaflet/leaflet.js",
  "./lib/leaflet/leaflet.css",
  "./lib/supabase/supabase.js",
  "./lib/capacitor/core.js",
  "./lib/capacitor/synapse.js",
  "./lib/capacitor/geolocation/index.js",
  "./lib/capacitor/geolocation/web.js",
  "./lib/capacitor/geolocation/definitions.js",
  "./lib/capacitor/maps-launcher/index.js",
  "./lib/capacitor/maps-launcher/web.js",
  "./lib/capacitor/maps-launcher/definitions.js",
  "./lib/capacitor/action-sheet/index.js",
  "./lib/capacitor/action-sheet/web.js",
  "./lib/capacitor/action-sheet/definitions.js",
  "./lib/capacitor/share/index.js",
  "./lib/capacitor/share/web.js",
  "./lib/capacitor/share/definitions.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      /* cache.addAll(APP_SHELL) mit reinen URL-Strings wuerde ueber den
         normalen HTTP-Cache des Browsers laufen -- bei einer geaenderten
         Datei (z.B. deals.json) koennte so trotz neuem CACHE_NAME eine
         veraltete, noch HTTP-gecachte Antwort ins neue Precache uebernommen
         werden. {cache:"reload"} erzwingt je Request einen echten
         Netzwerk-Fetch am HTTP-Cache vorbei. */
      .then((cache) => cache.addAll(APP_SHELL.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          if (req.mode === "navigate") return caches.match("./index.html");
        });
    })
  );
});
