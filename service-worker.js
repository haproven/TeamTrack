const CACHE_NAME = 'haproven-cache-v6';

const OFFLINE_URL = '/offline.html';
const NOT_FOUND_URL = '/404.html';
const FORBIDDEN_URL = '/403.html';
const SERVER_ERROR_URL = '/500.html';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/404.html',
  '/403.html',
  '/500.html',
  '/offline.html',

  // Main CSS / JS files:
  // '/css/style.css',
  // '/js/app.js',

  // Important images / fonts:
  // '/assets/img/logo.png',
  // '/assets/fonts/font.woff2'
];


/* =========================================================
   INSTALL
   ========================================================= */

self.addEventListener('install', (event) => {

  event.waitUntil(

    caches.open(CACHE_NAME)

      .then(async (cache) => {

        await Promise.all(

          STATIC_ASSETS.map(async (url) => {

            try {

              const request = new Request(url, {
                cache: 'reload'
              });

              await cache.add(request);

            } catch (error) {

              console.warn(
                '[Service Worker] Cache failed:',
                url
              );

            }

          })

        );

      })

      .then(() => self.skipWaiting())

  );

});


/* =========================================================
   ACTIVATE
   ========================================================= */

self.addEventListener('activate', (event) => {

  event.waitUntil(

    caches.keys()

      .then((cacheNames) => {

        return Promise.all(

          cacheNames.map((cacheName) => {

            if (cacheName !== CACHE_NAME) {

              return caches.delete(cacheName);

            }

          })

        );

      })

      .then(() => self.clients.claim())

  );

});


/* =========================================================
   FETCH
   ========================================================= */

self.addEventListener('fetch', (event) => {

  const request = event.request;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Ignore non HTTP/HTTPS requests
  if (
    !request.url.startsWith('http://') &&
    !request.url.startsWith('https://')
  ) {
    return;
  }


  /* =======================================================
     HTML NAVIGATION
     Network First
     ======================================================= */

  if (request.mode === 'navigate') {

    event.respondWith(

      fetch(request)

        .then(async (response) => {

          /* ---------- 404 ---------- */

          if (response.status === 404) {

            const page =
              await caches.match(NOT_FOUND_URL);

            return page || response;

          }


          /* ---------- 403 ---------- */

          if (response.status === 403) {

            const page =
              await caches.match(FORBIDDEN_URL);

            return page || response;

          }


          /* ---------- 500+ ---------- */

          if (response.status >= 500) {

            const page =
              await caches.match(SERVER_ERROR_URL);

            return page || response;

          }


          /* ---------- Successful Page ---------- */

          if (response.ok) {

            const cache =
              await caches.open(CACHE_NAME);

            await cache.put(
              request,
              response.clone()
            );

          }

          return response;

        })

        .catch(async () => {

          /* ---------- Offline Cached Page ---------- */

          const cachedPage =
            await caches.match(request);

          if (cachedPage) {
            return cachedPage;
          }


          /* ---------- Offline Page ---------- */

          const offlinePage =
            await caches.match(OFFLINE_URL);

          if (offlinePage) {
            return offlinePage;
          }


          /* ---------- Final Fallback ---------- */

          return new Response(
            `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport"
                    content="width=device-width, initial-scale=1.0">
              <title>Offline</title>
            </head>
            <body>
              <h1>You are offline</h1>
              <p>Please check your internet connection.</p>
            </body>
            </html>
            `,
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: {
                'Content-Type': 'text/html; charset=UTF-8'
              }
            }
          );

        })

    );

    return;
  }


  /* =======================================================
     STATIC ASSETS
     Stale While Revalidate
     ======================================================= */

  event.respondWith(

    caches.match(request)

      .then((cachedResponse) => {

        const networkRequest = fetch(request)

          .then(async (networkResponse) => {

            if (
              networkResponse &&
              networkResponse.ok &&
              networkResponse.type === 'basic'
            ) {

              const cache =
                await caches.open(CACHE_NAME);

              await cache.put(
                request,
                networkResponse.clone()
              );

            }

            return networkResponse;

          })

          .catch(() => {

            return null;

          });


        /* ---------- Cache First ---------- */

        if (cachedResponse) {

          // Update cache in background
          event.waitUntil(networkRequest);

          return cachedResponse;

        }


        /* ---------- No Cache ---------- */

        return networkRequest.then((response) => {

          if (response) {
            return response;
          }

          return new Response(
            'Resource unavailable',
            {
              status: 503,
              statusText: 'Service Unavailable'
            }
          );

        });

      })

  );

});