# VAPID Push Notifications Application
Simple demonstration application for Web Push notifications using VAPID (Voluntary Application Server Identification).

## Features

- **Multi-client support**: Manage separate subscriptions for Client A and Client B
- Automatic sending of 6 notifications per client:
  - 1 immediate notification upon subscription
  - 5 additional notifications sent every minute for 5 minutes
- **Client-specific messages** (managed server-side):
  - Client A receives: "Hello client A"
  - Client B receives: "Hello client B"
- Clicking a notification opens `http://perdu.com`
- **Smart notification suppression**: Notifications are not displayed if a tab with `perdu.com` is already open
- **Backend unsubscribe**: Unsubscribe button calls the backend to stop sending notifications server-side

## Installation and Configuration

### 1. Backend

```bash
cd backend
npm install
```

Generate VAPID keys
```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

You will get output like:
```
=======================================
Public Key:
BEl62xxxx

Private Key:
UUxxxx
=======================================
```
copy them to `backend/.env` file, create it if it doesn't exist. (copy paste .env.example)

Start the backend server:

```bash
npm run dev 
```

### 2. Frontend

```bash
cd frontend
node server.js
```

## Usage

1. Open the frontend application in your browser (`http://localhost:8000`)
2. You'll see two separate sections: **Client A** (blue) and **Client B** (green)
3. **Subscribe Client A**:
   - Click "Subscribe Client A"
   - Accept notification permissions if prompted
   - Client A will receive 6 notifications with the message "Hello client A"
4. **Subscribe Client B** (independently):
   - Click "Subscribe Client B"
   - Client B will receive 6 notifications with the message "Hello client B"
5. **Both clients can be subscribed simultaneously** and will receive their own notifications
6. Clicking any notification opens `http://perdu.com`
7. **Unsubscribe**:
   - Click the respective "Unsubscribe" button for each client
   - This calls the backend to cancel scheduled notifications and clears the subscription

## Testing with Closed Tab

To verify that notifications work even when the tab is closed:

1. Subscribe to notifications
2. Close the frontend tab
3. Scheduled notifications will continue to be sent and will appear even if the tab is closed!

## Important Notes
- Push notifications require HTTPS in production (except for localhost)
- The service worker must be served from the domain root
- For production, use a database to store subscriptions
- **Backend-managed unsubscribe**: The unsubscribe button now calls the `/unsubscribe` endpoint to cancel timers server-side, preventing further notifications
- **Client separation**: Each client (A and B) has its own subscription and receives only its designated notifications
- **Message customization**: All notification messages are managed server-side in the backend

## Resources
- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
- [MDN: Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [web-push library](https://github.com/web-push-libs/web-push)

## Troubleshooting
If no notifications received

#### Check Chrome/Edge 
1. Go to `chrome://settings/content/notifications`
2. Enable "Sites can ask to send notifications"
3. After subscribing, verify that `http://localhost:8000` is in the "Allowed" list

**macOS System Settings:**
1. Open **System Preferences** > **Notifications**
2. Find **Google Chrome** in the list
3. Enable notifications 
4. Recommended alert style: "Banners" or "Alerts"
5. Make sure "Do Not Disturb" mode is disabled
