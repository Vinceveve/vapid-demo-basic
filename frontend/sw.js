// Service Worker for handling push notifications

self.addEventListener('push', function(event) {
  console.log('Push notification received:', event);

  let data = {
    title: 'Notification',
    body: 'hello world',
    url: 'http://perdu.com'
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    data: {
      url: data.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);

  event.notification.close();

  const urlToOpen = event.notification.data.url || 'http://perdu.com';

  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});
