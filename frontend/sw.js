// Service Worker for handling push notifications

// Store the suppression preference (updated by messages from the page)
let suppressionEnabled = true; // Default value

// Listen for messages from the page to update the preference
self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "UPDATE_SUPPRESSION_PREFERENCE") {
    suppressionEnabled = event.data.value;
    console.log(
      "Service Worker: Suppression preference updated to",
      suppressionEnabled,
    );
  }
});

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
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        const hasTargetSiteOpen = clientList.some((client) => {
          try {
            const url = new URL(client.url);
            return (
              url.hostname === "localhost" ||
              url.hostname === "perdu.com" ||
              url.hostname === "www.perdu.com"
            );
          } catch (e) {
            return false;
          }
        });

        // Only suppress if both conditions are true:
        // 1. Suppression is enabled
        // 2. A target site tab is open
        if (suppressionEnabled && hasTargetSiteOpen) {
          console.log(
            "Target site tab is open and suppression enabled, notification suppressed",
          );
          return Promise.resolve();
        } else {
          console.log(
            "Showing notification (suppression:",
            suppressionEnabled,
            ", tab open:",
            hasTargetSiteOpen,
            ")",
          );
          return self.registration.showNotification(data.title, options);
        }
      })
      .catch((error) => {
        // If anything fails, just show the notification
        console.error("Error in notification logic:", error);
        return self.registration.showNotification(data.title, options);
      }),
  );
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification clicked:", event);

  event.notification.close();

  const urlToOpen = event.notification.data.url || "http://perdu.com";

  event.waitUntil(clients.openWindow(urlToOpen));
});
