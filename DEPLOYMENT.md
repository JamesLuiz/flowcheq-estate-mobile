# Flowcheq Estate Mobile — Deployment Guide

Expo app for **field agents**: GPS-verified property photos on-site.

---

## Prerequisites

- Node 20+
- Yarn (`apps/mobile/yarn.lock`)
- [Expo Go](https://expo.dev/go) on your phone (dev)
- Backend running and reachable from the phone

---

## Local development (Expo Go)

```bash
cd apps/mobile
yarn install
```

Create `.env` (or export):

```env
EXPO_PUBLIC_API_URL=http://YOUR_PC_LAN_IP:3000
```

**Important:** Use your computer's LAN IP, not `localhost`, when testing on a physical device.

```bash
yarn start --lan
# or: yarn start --tunnel   # if LAN/firewall blocks
```

Scan the QR code with Expo Go (Android) or Camera (iOS).

### Agent sign-in

1. Register/login as **agent** on the web app.  
2. Accept a **management request** from a landlord.  
3. Store JWT on device (app reads from `expo-secure-store` after web OAuth flow), or for dev set `EXPO_PUBLIC_AUTH_TOKEN`.

The home screen lists **managed properties** needing GPS capture.

---

## Capture workflow

1. **Home** → tap assignment  
2. **Intro** → start session  
3. **Camera** → wait for GPS lock, follow shot hints  
4. **Review** → tag rooms, retake if needed  
5. **Upload** → success screen  

Deep link (testing):

```
/nestin-capture?propertyId=MONGO_ID&title=Property%20Name
```

---

## Production build (EAS)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
eas build --platform ios
```

Set `EXPO_PUBLIC_API_URL` in EAS secrets / `eas.json` env.

Submit:

```bash
eas submit --platform android
eas submit --platform ios
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Network request failed | Same Wi‑Fi; use LAN IP; open firewall port 3000 |
| No assignments | Agent must have approved management requests |
| Upload 401 | JWT missing — sign in again |
| GPS not locking | Enable location permission; test outdoors |

---

## Related

- Full stack: [DEPLOYMENT.md](../../DEPLOYMENT.md)  
- Backend GPS endpoint: `POST /houses/:id/photos/gps-capture`
