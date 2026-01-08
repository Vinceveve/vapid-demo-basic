# VAPID Push Notifications Application
Simple demonstration application for Web Push notifications using VAPID (Voluntary Application Server Identification).

## Features

- Automatic sending of 6 notifications:
  - 1 immediate notification upon subscription
  - 5 additional notifications sent every minute for 5 minutes
- Notifications display "hello world"
- Clicking a notification opens `http://perdu.com`
- **Smart notification suppression**: Notifications are not displayed if a tab with `perdu.com` is already open
- Unsubscribe button to stop receiving notifications

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
2. Click "Subscribe to notifications"
3. Accept notification permissions
4. You will automatically receive:
   - 1 notification immediately
   - 5 additional notifications (1 per minute for 5 minutes)
5. Clicking any notification opens `http://perdu.com`
6. Click "Unsubscribe" to stop receiving notifications

## Testing with Closed Tab

To verify that notifications work even when the tab is closed:

1. Subscribe to notifications
2. Close the frontend tab
3. Scheduled notifications will continue to be sent and will appear even if the tab is closed!

## Important Notes
- Push notifications require HTTPS in production (except for localhost)
- The service worker must be served from the domain root
- For production, use a database to store subscriptions
- Unsubscribing stops the browser from displaying notifications, but server-side timers continue until completion another call should be made to cancel the timer on backend (or delete the subscription from the database).

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
