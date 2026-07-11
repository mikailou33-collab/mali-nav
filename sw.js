// Mali Nav VIP — Service Worker
const CACHE_NAME = 'mali-nav-v2';
const URLS_TO_CACHE = [
  '/mali-nav/',
  '/mali-nav/index.html',
  '/mali-nav/district-bamako-v2.html',
  '/mali-nav/region-kayes-v2.html',
  '/mali-nav/region-koulikoro-v2.html',
  '/mali-nav/region-sikasso-v2.html',
  '/mali-nav/region-segou.html',
  '/mali-nav/region-mopti.html',
  '/mali-nav/region-tombouctou-v2.html',
  '/mali-nav/region-gao.html',
  '/mali-nav/region-kidal.html',
  '/mali-nav/region-taoudenit.html',
  '/mali-nav/region-menaka.html',
  '/mali-nav/region-bougouni.html',
  '/mali-nav/region-dioila-v2.html',
  '/mali-nav/region-nioro.html',
  '/mali-nav/region-kita.html',
  '/mali-nav/region-nara.html',
  '/mali-nav/region-bandiagara-v2.html',
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

// Fetch — RESEAU EN PRIORITE (toujours la derniere version si internet
// disponible), cache uniquement utilise si hors ligne.
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).then(function(response) {
      // Mise a jour du cache avec la version fraiche recue
      var responseClone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) {
        cache.put(event.request, responseClone);
      });
      return response;
    }).catch(function() {
      // Hors ligne : on sert la derniere version connue en cache
      return caches.match(event.request).then(function(cached) {
        return cached || caches.match('/mali-nav/index.html');
      });
    })
  );
});
