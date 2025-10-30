const notifyClientsPwaReady = async () => {
  const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  clientList.forEach((client) => {
    client.postMessage({ type: 'PWA_READY' });
  });
};

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      await notifyClientsPwaReady();
    })()
  );
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      await self.skipWaiting();
    })()
  );
});
