/* Gestionnaires de notifications push, importés par le service worker Workbox. */
/* global self, clients */

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'Zéro Mensonge', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'Zéro Mensonge dans le Jeu';
  const options = {
    body: payload.body || payload.message || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    lang: 'fr',
    vibrate: [80, 40, 80],
    tag: payload.tag || 'zmj-notification',
    renotify: true,
    data: { url: payload.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return undefined;
    }),
  );
});
