const CACHE_NAME = 'juken-game-v1.2.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/apple-touch-icon.png',
    '/favicon-32x32.png',
    '/favicon-16x16.png',
    '/favicon.ico'
];

// インストール時
self.addEventListener('install', function(event) {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Caching files...');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// アクティベート時
self.addEventListener('activate', function(event) {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// フェッチ時
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // キャッシュにあれば返す
                if (response) {
                    return response;
                }
                
                // ネットワークから取得を試みる
                return fetch(event.request).then(function(response) {
                    // 無効なレスポンスの場合はそのまま返す
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // レスポンスをクローンしてキャッシュに保存
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
    );
});

// skipWaitingメッセージの処理
self.addEventListener('message', function(event) {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});