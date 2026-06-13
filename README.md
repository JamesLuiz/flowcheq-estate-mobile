# Flowcheq Estate — Mobile

Expo (React Native) app for field agents — **Flowcheq Capture** (GPS-verified listing photos).

Standalone repo. Includes `packages/nestin-capture` for the capture SDK.

| App | Local path (sibling) |
|-----|----------------------|
| **Web** | `../flowcheq-web` |
| **API** | `../flowcheq-backend` |

## Setup

```bash
yarn install   # or npm ci
# .env or app config:
# EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3000
yarn start
```

See `DEPLOYMENT.md` for Expo Go, EAS builds, and store submission.

**Not deployable with the web frontend** — ship via App Store / Play Store or Expo Go.
