import Fastify from "fastify";
import cors from "@fastify/cors";
import webpush from "web-push";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const fastify = Fastify({ logger: true });

// Store subscriptions in memory with their notification timers
const subscriptions: Map<
  string,
  {
    subscription: webpush.PushSubscription;
    timers: NodeJS.Timeout[];
  }
> = new Map();

// Configure VAPID keys (set these as environment variables)
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidEmail = process.env.VAPID_EMAIL || "mailto:example@example.com";

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error(
    "VAPID keys are not set. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.",
  );
  process.exit(1);
}

webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

// Enable CORS
fastify.register(cors, {
  origin: true,
});

// Get VAPID public key
fastify.get("/vapid-public-key", async () => {
  return { publicKey: vapidPublicKey };
});

// Helper function to send a notification
async function sendNotificationToSubscription(
  subscription: webpush.PushSubscription,
) {
  const payload = JSON.stringify({
    title: "Notification",
    body: "hello world",
    url: "http://perdu.com",
  });

  try {
    await webpush.sendNotification(subscription, payload);
    console.log(
      "Notification sent successfully to",
      subscription.endpoint.substring(0, 50) + "...",
    );
    return true;
  } catch (error) {
    console.error("Error sending notification:", error);
    return false;
  }
}

// Subscribe endpoint
fastify.post("/subscribe", async (request, reply) => {
  const subscription = request.body as webpush.PushSubscription;
  const subscriptionKey = subscription.endpoint;

  // Clear existing timers if subscription already exists
  if (subscriptions.has(subscriptionKey)) {
    const existing = subscriptions.get(subscriptionKey);
    existing?.timers.forEach((timer) => clearTimeout(timer));
  }

  // Store subscription
  const timers: NodeJS.Timeout[] = [];
  subscriptions.set(subscriptionKey, { subscription, timers });

  console.log("New subscription:", subscriptionKey.substring(0, 50) + "...");
  console.log("Total subscriptions:", subscriptions.size);

  // Send immediate notification
  await sendNotificationToSubscription(subscription);

  // Schedule notifications every minute for 5 minutes
  for (let i = 1; i <= 5; i++) {
    const timer = setTimeout(
      async () => {
        console.log(`Sending scheduled notification ${i}/5`);
        await sendNotificationToSubscription(subscription);
      },
      i * 60 * 1000,
    ); // i minutes in milliseconds

    timers.push(timer);
  }

  return {
    success: true,
    message:
      "Subscribed! You will receive 6 notifications (1 now + 5 over the next 5 minutes)",
  };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server listening on http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
