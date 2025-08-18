/**
 * Service Worker for Smart Expense Tracker
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'expense-tracker-v2.0.0';
const STATIC_CACHE = 'static-v2.0.0';
const DYNAMIC_CACHE = 'dynamic-v2.0.0';

// Files to cache for offline use
const STATIC_FILES = [
    '/',
    '/index.html',
    '/style.css',
    '/css/enhanced-features.css',
    '/script.js',
    '/js/core/app.js',
    '/js/modules/data-manager.js',
    '/js/modules/notification-manager.js',
    '/js/modules/settings-manager.js',
    '/js/modules/budget-manager.js',
    '/js/modules/data-export-import.js',
    '/js/modules/recurring-expenses.js',
    '/js/modules/analytics-manager.js',
    '/js/modules/search-manager.js',
    '/js/modules/goals-manager.js',
    '/js/modules/chart-manager.js',
    '/js/modules/reports-manager.js',
    '/counter.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached files when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip external requests (except Google Fonts)
    if (!request.url.startsWith(self.location.origin) && 
        !request.url.includes('fonts.googleapis.com') &&
        !request.url.includes('fonts.gstatic.com')) {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // Fetch from network and cache the response
                return fetch(request)
                    .then((networkResponse) => {
                        // Check if valid response
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // Clone the response for caching
                        const responseToCache = networkResponse.clone();
                        
                        // Cache dynamic content
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });
                        
                        return networkResponse;
                    })
                    .catch(() => {
                        // If network fails, try to serve the main page for navigation requests
                        if (request.destination === 'document') {
                            return caches.match('/');
                        }
                        
                        // For other resources, return a meaningful error response
                        return new Response('Offline - Resource not available', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
});

// Background sync for data synchronization (when online)
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'expense-sync') {
        event.waitUntil(syncExpenseData());
    }
});

// Push notification handling
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200],
        data: data.data,
        actions: data.actions || []
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action) {
        // Handle action buttons
        switch (event.action) {
            case 'view-budget':
                openApp('/budget');
                break;
            case 'add-expense':
                openApp('/add-expense');
                break;
            default:
                openApp('/');
        }
    } else {
        // Default action - open app
        openApp('/');
    }
});

// Helper functions
async function syncExpenseData() {
    try {
        // This would sync local data with a server if available
        console.log('Service Worker: Syncing expense data...');
        
        // For now, just log that sync was attempted
        // In a real implementation, this would:
        // 1. Get pending data from IndexedDB
        // 2. Send to server
        // 3. Update local storage on success
        
        return Promise.resolve();
    } catch (error) {
        console.error('Service Worker: Sync failed', error);
        throw error;
    }
}

function openApp(path = '/') {
    return clients.matchAll()
        .then((clientList) => {
            // Check if app is already open
            for (let client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Open new window if app is not open
            if (clients.openWindow) {
                return clients.openWindow(path);
            }
        });
}

// Periodic background tasks
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'expense-backup') {
        event.waitUntil(performBackup());
    }
});

async function performBackup() {
    try {
        console.log('Service Worker: Performing automatic backup...');
        
        // This would create an automatic backup of user data
        // Implementation would involve:
        // 1. Reading data from localStorage
        // 2. Creating backup file
        // 3. Optionally uploading to cloud storage
        
        return Promise.resolve();
    } catch (error) {
        console.error('Service Worker: Backup failed', error);
        throw error;
    }
}

// Message handling for communication with main app
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_CACHE_SIZE':
            getCacheSize()
                .then((size) => {
                    event.ports[0].postMessage({ size });
                });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches()
                .then(() => {
                    event.ports[0].postMessage({ success: true });
                });
            break;
            
        case 'FORCE_UPDATE':
            forceUpdate()
                .then(() => {
                    event.ports[0].postMessage({ success: true });
                });
            break;
            
        default:
            console.log('Service Worker: Unknown message type', type);
    }
});

async function getCacheSize() {
    const cacheNames = await caches.keys();
    let totalSize = 0;
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }
    
    return totalSize;
}

async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
}

async function forceUpdate() {
    // Force update by clearing caches and reloading
    await clearAllCaches();
    
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({ type: 'RELOAD' });
    });
}

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker: Error occurred', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled promise rejection', event.reason);
});

console.log('Service Worker: Script loaded successfully');
