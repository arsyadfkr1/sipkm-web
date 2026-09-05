const CACHE_NAME = 'sipkm-cache-v1';
const urlsToCache = [
  '/',
  '/login',
  '/beranda',
  '/buat-laporan',
  '/riwayat',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Hanya gunakan Network First untuk semua request agar tidak merusak Next.js hydration
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Jika berhasil ambil dari network, simpan ke cache jika itu adalah navigasi
        if (event.request.mode === 'navigate') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Jika offline, coba ambil dari cache
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
