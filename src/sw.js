const CACHE_NAME = 'farkle-v13';
const ASSETS = [
    '/',
    'index.html',
    'css/styles.css',
    'css/menu-buttons.css',
    'css/bracket.css',
    'js/i18n.js',
    'js/scoring.js',
    'js/dice.js',
    'js/game.js',
    'js/ai.js',
    'js/settings.js',
    'js/ui.js',
    'js/loader.js',
    'manifest.json',
    'img/leather.png',
    'img/parchment.png',
    'img/table.png',
    'img/icon.svg',
    'img/icon-192.png',
    'img/icon-512.png',
    'js/updater.js',
    'audio/bar-brawl.mp3',
    'audio/village-tarantella.mp3',
    'audio/still-pickin.mp3'
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
    // The self-updater version stamp and the release check must always be fresh
    const url = event.request.url;
    if (url.includes('version.json') || url.includes('api.github.com')) {
        event.respondWith(fetch(event.request));
        return;
    }
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
