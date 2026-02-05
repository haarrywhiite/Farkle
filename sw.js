const CACHE_NAME = 'farkle-v2';
const ASSETS = [
    '/',
    'index.html',
    'css/styles.css',
    'css/menu-buttons.css',
    'css/bracket.css',
    'js/scoring.js',
    'js/dice.js',
    'js/game.js',
    'js/ai.js',
    'js/ui.js',
    'manifest.json',
    'img/leather.png',
    'img/parchment.png',
    'img/table.png',
    'img/icon.svg'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
