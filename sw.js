// Mali Nav VIP — Service Worker
const CACHE_NAME = 'mali-nav-v1';
const URLS_TO_CACHE = [
  '/mali-nav/',
  '/mali-nav/index.html',
  '/mali-nav/district-bamako.html',
  '/mali-nav/region-kayes-v2.html',
  '/mali-nav/region-koulikoro.html',
  '/mali-nav/region-sikasso.html',
  '/mali-nav/region-segou.html',
  '/mali-nav/region-mopti.html',
  '/mali-nav/region-tombouctou.html',
  '/mali-nav/region-gao.html',
  '/mali-nav/region-kidal.html',
  '/mali-nav/region-taoudenit.html',
  '/mali-nav/region-menaka.html',
  '/mali-nav/region-bougouni.html',
  '/mali-nav/region-dioila.html',
  '/mali-nav/region-nioro.html',
  '/mali-nav/region-kita.html',
  '/mali-nav/region-nara.html',
  '/mali-nav/region-bandiagara.html',
  '/mali-nav/region-san.html',
  '/mali-nav/region-douentza.html',
  '/mali-nav/region-koutiala.html'
];

// Installation — mise en cache
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation — nettoyer anciens caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — servir depuis cache si hors ligne
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request).catch(function() {
        // Hors ligne → page d'accueil
        return caches.match('/mali-nav/index.html');
      });
    })
  );
});
