const API_URL = "http://localhost:3000";

const subscribeBtn = document.getElementById("subscribeBtn");
const unsubscribeBtn = document.getElementById("unsubscribeBtn");
const statusDiv = document.getElementById("status");

// Show status message
function showStatus(message, type = "info") {
  statusDiv.textContent = message;
  statusDiv.classList.remove("hidden");
  statusDiv.className = "mt-6 p-4 rounded-lg border-l-4";

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

// Subscribe to push notifications
async function subscribeUser() {
  try {
    showStatus("Subscribing...", "info");

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

    // Send subscription to server
    const response = await fetch(`${API_URL}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Registration error");
    }

    showStatus(
      data.message ||
        "Subscription successful! You will receive 6 notifications automatically.",
      "success",
    );
    subscribeBtn.disabled = true;
    unsubscribeBtn.classList.remove("hidden");
  } catch (error) {
    console.error("Error:", error);
    showStatus(`Error: ${error.message}`, "error");
  }
}

// Unsubscribe from push notifications
async function unsubscribeUser() {
  try {
    showStatus("Unsubscribing...", "info");

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      throw new Error("No service worker registered");
    }

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      throw new Error("No subscription found");
    }

    // Unsubscribe from push
    await subscription.unsubscribe();

    showStatus(
      "Unsubscription successful! You will no longer receive notifications.",
      "success",
    );
    subscribeBtn.disabled = false;
    unsubscribeBtn.classList.add("hidden");
  } catch (error) {
    console.error("Error:", error);
    showStatus(`Error: ${error.message}`, "error");
  }
}

// Event listeners
subscribeBtn.addEventListener("click", subscribeUser);
unsubscribeBtn.addEventListener("click", unsubscribeUser);

// Check if already subscribed on load
(async () => {
  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          subscribeBtn.disabled = true;
          unsubscribeBtn.classList.remove("hidden");
          showStatus(
            "Already subscribed to notifications. You will receive notifications automatically.",
            "success",
          );
        }
      }
    }
  } catch (error) {
    console.error("Error checking subscription:", error);
  }
})();
