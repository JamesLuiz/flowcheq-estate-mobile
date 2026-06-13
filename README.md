# Flowcheq Estate — Mobile (Expo)

Landlord listing photos must use **Flowcheq Capture** (`/nestin-capture` route).

## Setup

```bash
cd apps/mobile
npm install
npx expo start
```

## Features

- `NestinCameraScreen` — rear camera + live GPS lock (expo-camera, expo-location)
- `CaptureReviewGrid` — tag each shot, retake (no gallery)
- Shared validation in `packages/nestin-capture`

## Upload to listing

Open capture with a listing id, then confirm to upload:

```
/nestin-capture?propertyId=<HOUSE_MONGO_ID>
```

Env (`.env` or Expo app config):

```
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_AUTH_TOKEN=<optional dev fallback — landlord JWT from web login>
```

Auth tokens are read from **expo-secure-store** first (`setAuthToken` in `src/lib/authToken.ts`). Use `EXPO_PUBLIC_AUTH_TOKEN` only for local dev when you have not stored a token on device.

Upload calls `POST /houses/:id/photos/gps-capture` with multipart GPS metadata.
