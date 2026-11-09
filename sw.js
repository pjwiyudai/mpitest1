/* Service worker MPI TP 7.4 — menyimpan aplikasi agar tetap bisa dipakai saat internet terputus.
   Setiap kali index.html diubah, naikkan angka VERSION agar perangkat murid mengambil versi baru. */
const VERSION = 'mpi74-v5';
/* Hanya cache milik unit ini ('mpi74-…') yang boleh dihapus — cache unit lain di repositori yang sama tetap aman. */
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('mpi74-') && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Ambil dari cache dulu (cepat & tahan putus jaringan), lalu perbarui cache di latar belakang bila online. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const key = req.mode === 'navigate' ? './index.html' : req;
      const cached = await cache.match(key, { ignoreSearch: true });
      const network = fetch(req).then(res => {
        if (res && res.ok) cache.put(key, res.clone());
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
