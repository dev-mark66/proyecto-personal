const V = 'elite-sport-v2';
const SHELL = ['./', 'index.html', 'pages/cliente.html', 'pages/admin.html', 'manifest.json', 'css/main.css', 'css/tema.css', 'css/fondo.css',
 'js/core/main.js', 'js/core/auth.js', 'js/core/pwa.js', 'js/core/config.js', 'js/core/almacen.js', 'js/core/utils.js', 'js/views/catalogo.js', 'js/views/admin.js',
 'js/avances/animaciones.js', 'js/avances/alertas.js', 'js/avances/validaciones.js', 'js/avances/zoom.js', 'js/avances/tema.js', 'js/avances/dropbox.js',
 'js/avances/hidratacion.js', 'js/avances/lazy-loading.js', 'js/avances/seguridad-xss.js', 'js/avances/delegacion-eventos.js', 'assets/data/productos.json'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => Promise.allSettled(SHELL.map(u => c.add(u))))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const mismo = new URL(e.request.url).origin === location.origin;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(V).then(ch => ch.put(e.request, c)); } return r; })
    .catch(() => caches.match(e.request).then(r => r || (mismo ? caches.match('index.html') : Response.error()))));
});
