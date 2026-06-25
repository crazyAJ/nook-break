const CACHE_NAME = 'clockout-audio-v1';
const AUDIO_URLS = ['/audio/clockout-theme.ogg', '/audio/clockout-theme.mp3'];

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_CLOCKOUT_AUDIO') {
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      const urls = Array.isArray(event.data?.urls) ? event.data.urls : AUDIO_URLS;
      await cache.addAll(urls);
    }),
  );
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (!AUDIO_URLS.includes(requestUrl.pathname)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }

        const copy = response.clone();
        void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    }),
  );
});
