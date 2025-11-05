// Service Worker for Push Notifications
const CACHE_NAME = 'garden-cache-v1';
const urlsToCache = [
    '/',
    '/styles.css',
    '/script.js',
    '/garden-enhancements.js',
    '/push-notifications.js',
    '/achievements-system.js'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
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