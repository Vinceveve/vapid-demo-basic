const API_URL = "http://localhost:3000";

// Store subscriptions for each client
const clientSubscriptions = {
  "client A": null,
  "client B": null,
};

// Get DOM elements for Client A
const subscribeClientABtn = document.getElementById("subscribeClientA");
const unsubscribeClientABtn = document.getElementById("unsubscribeClientA");
const statusClientADiv = document.getElementById("statusClientA");

// Get DOM elements for Client B
const subscribeClientBBtn = document.getElementById("subscribeClientB");
const unsubscribeClientBBtn = document.getElementById("unsubscribeClientB");
const statusClientBDiv = document.getElementById("statusClientB");

// Get DOM element for suppression checkbox
const suppressCheckbox = document.getElementById("suppressWhenLocalhostOpen");

// Helper function to notify service worker of preference change
async function notifyServiceWorker(value) {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        registration.active.postMessage({
          type: "UPDATE_SUPPRESSION_PREFERENCE",
          value: value,
        });
        console.log("Sent suppression preference to service worker:", value);
      } else {
        console.warn("Service worker not active yet");
      }
    } catch (error) {
      console.error("Error sending message to service worker:", error);
    }
  }
}

// Preference helper functions (using localStorage for better compatibility)
function saveSuppressPreference(value) {
  localStorage.setItem("suppressWhenLocalhostOpen", JSON.stringify(value));
  console.log("Suppression preference saved to localStorage:", value);

  // Notify the service worker
  notifyServiceWorker(value);
}

function loadSuppressPreference() {
  const saved = localStorage.getItem("suppressWhenLocalhostOpen");
  if (saved !== null) {
    return JSON.parse(saved);
  }
  return true; // Default: suppression enabled
}

// Show status message
function showStatus(statusDiv, message, type = "info") {
  statusDiv.textContent = message;
  statusDiv.classList.remove("hidden");
  statusDiv.className = "mt-4 p-4 rounded-lg border-l-4";

  if (type === "error") {
    statusDiv.classList.add("bg-red-50", "border-red-500", "text-red-700");
  } else if (type === "success") {
    statusDiv.classList.add(
      "bg-green-50",
      "border-green-500",
      "text-green-700",
    );
  } else {
    statusDiv.classList.add("bg-blue-50", "border-blue-500", "text-blue-700");
  }
}

// Convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Register service worker
async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker not supported");
  }

  const registration = await navigator.serviceWorker.register("sw.js");
  await navigator.serviceWorker.ready;
  return registration;
}

// Get VAPID public key from server
async function getVapidPublicKey() {
  const response = await fetch(`${API_URL}/vapid-public-key`);
  const data = await response.json();
  return data.publicKey;
}

// Subscribe to push notifications for a specific client
async function subscribeClient(
  clientId,
  statusDiv,
  subscribeBtn,
  unsubscribeBtn,
) {
  try {
    showStatus(statusDiv, "Subscribing...", "info");

    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("Notification permission denied");
    }

    // Register service worker
    const registration = await registerServiceWorker();

    // Get VAPID public key
    const vapidPublicKey = await getVapidPublicKey();
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    });

    // Store subscription locally
    clientSubscriptions[clientId] = subscription;

    // Send subscription to server with clientId
    const response = await fetch(`${API_URL}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription: subscription,
        clientId: clientId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration error");
    }

    showStatus(
      statusDiv,
      data.message || `Subscription successful for ${clientId}!`,
      "success",
    );
    subscribeBtn.disabled = true;
    unsubscribeBtn.classList.remove("hidden");
  } catch (error) {
    console.error("Error:", error);
    showStatus(statusDiv, `Error: ${error.message}`, "error");
  }
}

// Unsubscribe from push notifications for a specific client
async function unsubscribeClient(
  clientId,
  statusDiv,
  subscribeBtn,
  unsubscribeBtn,
) {
  try {
    showStatus(statusDiv, "Unsubscribing...", "info");

    const subscription = clientSubscriptions[clientId];

    if (!subscription) {
      throw new Error("No subscription found");
    }

    // Notify backend to stop sending notifications
    const response = await fetch(`${API_URL}/unsubscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        clientId: clientId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unsubscribe error");
    }

    // Unsubscribe from push on client side
    await subscription.unsubscribe();
    clientSubscriptions[clientId] = null;

    showStatus(
      statusDiv,
      data.message || `Unsubscription successful for ${clientId}!`,
      "success",
    );
    subscribeBtn.disabled = false;
    unsubscribeBtn.classList.add("hidden");
  } catch (error) {
    console.error("Error:", error);
    showStatus(statusDiv, `Error: ${error.message}`, "error");
  }
}

// Event listeners for Client A
subscribeClientABtn.addEventListener("click", () => {
  subscribeClient(
    "client A",
    statusClientADiv,
    subscribeClientABtn,
    unsubscribeClientABtn,
  );
});

unsubscribeClientABtn.addEventListener("click", () => {
  unsubscribeClient(
    "client A",
    statusClientADiv,
    subscribeClientABtn,
    unsubscribeClientABtn,
  );
});

// Event listeners for Client B
subscribeClientBBtn.addEventListener("click", () => {
  subscribeClient(
    "client B",
    statusClientBDiv,
    subscribeClientBBtn,
    unsubscribeClientBBtn,
  );
});

unsubscribeClientBBtn.addEventListener("click", () => {
  unsubscribeClient(
    "client B",
    statusClientBDiv,
    subscribeClientBBtn,
    unsubscribeClientBBtn,
  );
});

// Save suppression preference when checkbox changes
suppressCheckbox.addEventListener("change", () => {
  saveSuppressPreference(suppressCheckbox.checked);
  console.log(
    "Notification suppression:",
    suppressCheckbox.checked ? "enabled" : "disabled",
  );
});

// Load suppression preference on load
const loadedPreference = loadSuppressPreference();
suppressCheckbox.checked = loadedPreference;
console.log("Loaded suppression preference:", loadedPreference);

// Send initial preference to service worker when it's ready
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.ready.then(() => {
    notifyServiceWorker(loadedPreference);
  });
}

// Check if already subscribed on load
(async () => {
  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          // Note: We can't determine which client this subscription belongs to
          // In a real app, you'd need to store this info in localStorage
          showStatus(
            statusClientADiv,
            "A subscription already exists. Please refresh if you want to start fresh.",
            "info",
          );
        }
      }
    }
  } catch (error) {
    console.error("Error checking subscription:", error);
  }
})();
