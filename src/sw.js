/* eslint-disable no-restricted-globals */
const CACHE_NAME = "story-app-v2";
const STATIC_CACHE = "story-app-static-v2";
const API_CACHE = "story-app-api-v2";

const staticAssets = [
    "/",
    "/index.html",
    "/manifest.json",
    "/styles.css",
    "/src/main.js",
    "/src/router.js",
    "/src/presenters/pagePresenter.js",
    "/src/models/apiModel.js",
    "/src/models/dataModel.js",
    "/src/db/favorite-db.js",
    "/scripts/sw.js",
    "/src/pwa-init.js",
    "/src/views/homeView.js",
    "/src/views/aboutView.js",
    "/src/views/contactView.js",
    "/src/views/mapView.js",
    "/src/views/addstoryView.js",
    "/src/views/favoritesView.js",
    "/src/views/login-page.js",
    "/src/views/register-page.js",
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
];

// Install & cache shell
self.addEventListener("install", (event) => {
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then((cache) => cache.addAll(staticAssets)),
            caches.open(API_CACHE).then(() => console.log("API cache created"))
        ])
    );
    self.skipWaiting();
});

// Activate & clear old cache
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((names) =>
            Promise.all(names.filter((n) => !n.includes("v2")).map((n) => caches.delete(n)))
        )
    );
    self.clients.claim();
});

// Fetch strategy: network-first for API, cache-first for static assets
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // Network-first for API calls (stories)
    if (url.origin === "https://story-api.dicoding.dev") {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const resToCache = response.clone();
                        caches.open(API_CACHE).then((cache) => cache.put(event.request, resToCache));
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if network fails
                    return caches.match(event.request);
                })
        );
    } else {
        // Cache-first for static assets
        event.respondWith(
            caches.match(event.request).then((cacheRes) => {
                return cacheRes || fetch(event.request).then((response) => {
                    if (response && response.status === 200 && response.type === "basic") {
                        const resToCache = response.clone();
                        caches.open(STATIC_CACHE).then((cache) => cache.put(event.request, resToCache));
                    }
                    return response;
                });
            })
        );
    }
});

// Push Notification
self.addEventListener("push", (event) => {
    let data = {};
    if (event.data) data = event.data.json();

    const title = data.title || "Cerita Baru!";
    const body = data.message || "Cek cerita terbaru di aplikasi!";
    const icon = data.icon || "/icons/icon-192x192.png";

    const options = {
        body,
        icon,
        data: {
            url: data.url || "/#/add-story",
        },
        actions: [
            {
                action: "view",
                title: "View Story",
            },
            {
                action: "dismiss",
                title: "Dismiss",
            }
        ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

// Klik notifikasi → buka halaman terkait
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    if (event.action === "view") {
        const target = event.notification.data.url;
        event.waitUntil(clients.openWindow(target));
    } else if (event.action === "dismiss") {
        // Notification already closed
        console.log("Notification dismissed");
    }
});
