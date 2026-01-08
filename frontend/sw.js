// Service Worker for handling push notifications

self.addEventListener("push", function (event) {
  console.log("Push notification received:", event);

  let data = {
    title: "Notification",
    body: "hello world",
    url: "http://perdu.com",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error("Error parsing push data:", e);
    }
  }

  const options = {
    body: data.body,
    icon: "/icon.png",
    badge: "/badge.png",
    data: {
      url: data.url,
    },
  };

  event.waitUntil(
    clients
      // see https://developer.mozilla.org/en-US/docs/Web/API/Clients/matchAll
      .matchAll({ type: "all", includeUncontrolled: false })
      .then(function (clientList) {
        const hasTabOpen = clientList.some((client) => {
          try {
            const url = new URL(client.url);
            return url.hostname === "localhost";
          } catch (e) {
            return false;
          }
        });

        // Only show notification if localhost is closed
        if (!hasTabOpen) {
          console.log("Tab is not open, showing notification");
          return self.registration.showNotification(data.title, options);
        } else {
          console.log("tab is open, notification suppressed");
          return Promise.resolve();
        }
      }),
  );
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification clicked:", event);

  event.notification.close();

  const urlToOpen = event.notification.data.url || "http://perdu.com";

  event.waitUntil(clients.openWindow(urlToOpen));
});
