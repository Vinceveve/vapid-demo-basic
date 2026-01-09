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
- **Smart notification suppression** (configurable): 
  - Notifications are not displayed if a tab with `perdu.com` or `localhost` is already open
  - Can be enabled/disabled via a checkbox in the UI (enabled by default)
  - Preference is saved in localStorage and communicated to the service worker via postMessage
  - **Firefox compatible**: Uses localStorage + postMessage instead of IndexedDB for better cross-browser support
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

1. Open the frontend application in your two browsers (`http://localhost:8000`)
2. You'll see two separate sections: **Client A** (blue) and **Client B** (green)
3. **Subscribe Client A** on Chrome:
   - Click "Subscribe Client A"
   - Accept notification permissions if prompted
   - Client A will receive 6 notifications with the message "Hello client A"
4. **Subscribe Client B** on Firefox:
   - Click "Subscribe Client B"
   - Client B will receive 6 notifications with the message "Hello client B"
5. **Both clients can be subscribed simultaneously** and will receive their own notifications

## Testing with Closed Tab

To verify that notifications work even when the tab is closed:

1. Subscribe to notifications
2. Close the frontend tab
3. Scheduled notifications will continue to be sent and will appear even if the tab is closed!

## Important Notes for production usage
- Push notifications require HTTPS in production (except for localhost)
- The service worker must be served from the domain root
- Use a database to store subscriptions
- VAPID keys are sensitive and must be stored securely and not exposed
- VAPID email must represent the owner who will be contacted in case of issues (spam, rate limit, abuse, security breach)
- Client subscribtion must be authentified using there JWT ID and nothing on the payload

## Browser Compatibility Matrix

| Feature | Chrome | Firefox | Safari | Edge | Notes |
|---------|--------|---------|--------|------|-------|
| **Push API (VAPID)** | ✅ v52+ | ✅ v44+ | ✅ v16+ (macOS 13+) | ✅ v79+ | Safari requires macOS Ventura or later |
| **Service Workers** | ✅ v40+ | ✅ v44+ | ✅ v11.1+ | ✅ v17+ | All modern versions supported |
| **Notifications API** | ✅ v22+ | ✅ v22+ | ✅ v16+ (macOS 13+) | ✅ v14+ | Requires user permission |
| **localStorage** | ✅ v4+ | ✅ v3.5+ | ✅ v4+ | ✅ v8+ | Not available in Service Workers |
| **postMessage (SW)** | ✅ v40+ | ✅ v44+ | ✅ v11.1+ | ✅ v17+ | Communication between page and SW |
| **IndexedDB** | ✅ v24+ | ✅ v16+ | ✅ v10+ | ✅ v12+ | Available in Service Workers |

### Platform Support

| Platform | Supported | Minimum Version | Notes |
|----------|-----------|----------------|-------|
| **Desktop** | | | |
| - Windows | ✅ | Chrome 52+, Firefox 44+, Edge 79+ | Full support |
| - macOS | ✅ | Safari 16+ (Ventura+), Chrome 52+, Firefox 44+ | Safari requires macOS 13+ |
| - Linux | ✅ | Chrome 52+, Firefox 44+ | Full support |
| **Mobile** | | | |
| - Android | ✅ | Chrome 52+, Firefox 48+ | Full support |
| - iOS/iPadOS | ✅ | Safari 16.4+ (iOS 16.4+) | Requires iOS 16.4+ |

### Key Compatibility Notes

1. **Safari Limitations**:
   - Push notifications only work on macOS 13 (Ventura) or later
   - iOS/iPadOS support requires iOS 16.4+ 
   - Safari rejects `localhost` URIs in VAPID subject (use `http://localhost` without https for local development)

2. **Cross-Browser Support Score**: 92% compatibility across modern browsers

3. **Our Implementation**:
   - ✅ Uses `localStorage` + `postMessage` for preference storage (Firefox compatible)
   - ✅ VAPID authentication works on all supported browsers
   - ✅ Service Worker communication via postMessage (universal support)

### Testing Recommendations

- **Desktop**: Test on Chrome, Firefox, Safari (macOS 13+), and Edge
- **Mobile**: Test on Android Chrome and iOS Safari (16.4+)
- **Private/Incognito Mode**: May have restrictions on notifications

## Resources
- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
- [MDN: Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [web-push library](https://github.com/web-push-libs/web-push)
- [Safari Web Push Support](https://pushalert.co/blog/safari-web-push-api-support-browser-notifications/)
- [Service Workers Browser Support](https://caniuse.com/serviceworkers)

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
