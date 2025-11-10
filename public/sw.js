// Enhanced Service Worker for PWA
const CACHE_NAME = 'garden-v2.1';
const STATIC_CACHE = 'static-v2.1';
const DYNAMIC_CACHE = 'dynamic-v2.1';
const API_CACHE = 'api-v2.1';

const STATIC_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/garden-enhancements.js',
    '/push-notifications.js',
    '/achievements-system.js',
    '/help.html',
    '/manifest.json'
];

// Install - Cache static resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_FILES)),
            self.skipWaiting()
        ])
    );
});

// Activate - Clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (!cacheName.includes('v2.1')) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            self.clients.claim()
        ])
    );
});

// Fetch - Advanced caching strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // API requests - Network first, cache fallback
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(API_CACHE).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Static files - Cache first
    if (STATIC_FILES.includes(url.pathname)) {
        event.respondWith(
            caches.match(request)
                .then(response => response || fetch(request))
        );
        return;
    }

    // Other requests - Network first, dynamic cache
    event.respondWith(
        fetch(request)
            .then(response => {
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(DYNAMIC_CACHE).then(cache => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => caches.match(request))
    );
});

// Push event
self.addEventListener('push', (event) => {
    const options = {
        body: '您有新的花园动态！',
        icon: '/favicon.ico',
        badge: '/badge-icon.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '查看详情',
                icon: '/action-icon.png'
            },
            {
                action: 'close',
                title: '关闭',
                icon: '/close-icon.png'
            }
        ]
    };

    if (event.data) {
        const data = event.data.json();
        options.body = data.body || options.body;
        options.title = data.title || '云端花园';
        options.icon = data.icon || options.icon;
        options.data = { ...options.data, ...data };
    }

    event.waitUntil(
        self.registration.showNotification('云端花园', options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.matchAll().then((clientList) => {
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

// Background sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Sync offline data when connection is restored
    try {
        const offlineQueue = await getOfflineQueue();
        for (const action of offlineQueue) {
            await fetch(action.url, action.options);
        }
        await clearOfflineQueue();
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

async function getOfflineQueue() {
    // Get offline queue from IndexedDB or localStorage
    return JSON.parse(localStorage.getItem('offlineQueue') || '[]');
}

async function clearOfflineQueue() {
    localStorage.removeItem('offlineQueue');
}