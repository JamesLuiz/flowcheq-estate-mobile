# Flowcheq Estate Mobile — Deployment Guide

Expo app for **field agents**: GPS-verified property photos (Flowcheq Capture).

**Agent distribution (App Store, Play Store, website APK):** see **[AGENT_DISTRIBUTION.md](./AGENT_DISTRIBUTION.md)**.

---

## Prerequisites

- Node 20+
- Yarn
- [Expo Go](https://expo.dev/go) on your phone (dev only)
- Backend running and reachable from the phone

---

## Local development (Expo Go)

```bash
yarn install
```

Create `.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR_PC_LAN_IP:3000
```

Use your computer's **LAN IP**, not `localhost`, on a physical device.

```bash
yarn start --lan
# or: yarn start --tunnel
```

### Agent sign-in

1. Register/login as **agent** on the web app.
2. Get a **management request** approved by a landlord.
3. JWT is stored in `expo-secure-store` after sign-in.

---

## Production builds (EAS)

```bash
npm install -g eas-cli
eas login
eas init
eas build --platform android --profile production
eas build --platform ios --profile production
```

See `eas.json` for profiles (`preview`, `production`, `production-apk`).

---

## Related

- **Backend API:** `flowcheq-estate-backend` repo
- **Agent download page:** `https://estate.flowcheq.com/agents/app` (web repo)
- GPS upload endpoint: `POST /houses/:id/photos/gps-capture`
