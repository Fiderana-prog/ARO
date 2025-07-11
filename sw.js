// sw.js
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/') // ← redirection vers la page principale
  );
});
