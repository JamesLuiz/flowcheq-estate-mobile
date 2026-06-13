# Agent app distribution — iOS & Android

How to ship **Flowcheq Estate** (Flowcheq Capture) so agents install it officially from your website and it runs on real devices in production.

---

## Reality check (read this first)

| Platform | Download from your website | Recommended official channel |
|----------|---------------------------|------------------------------|
| **Android** | Yes — host an **APK** or link to **Google Play** | Google Play (best) or signed APK on `estate.flowcheq.com/download` |
| **iOS** | **No** direct IPA install for the public (Apple blocks it) | **App Store** or **TestFlight** link on your site |

Your website should show **two buttons**: “Get on Google Play” / “Download for Android” and “Get on App Store” (or TestFlight while in beta).

---

## Prerequisites (one-time)

1. **Expo account** — https://expo.dev (free tier works for builds)
2. **EAS CLI**
   ```bash
   npm install -g eas-cli
   eas login
   ```
3. **Apple Developer Program** — $99/year (required for iOS App Store / TestFlight)
4. **Google Play Console** — $25 one-time (required for Play Store; optional if you only ship APK)
5. **Production API** — backend live at e.g. `https://api.estate.flowcheq.com`
6. **App assets** (add before store submission):
   - `assets/icon.png` — 1024×1024
   - `assets/adaptive-icon.png` — 1024×1024 (Android)
   - `assets/splash.png` — 1284×2778 recommended  
   Wire them in `app.json` under `expo.icon`, `expo.splash.image`, `expo.android.adaptiveIcon.foregroundImage`.

---

## Step 1 — Link project to EAS

From the mobile repo root:

```bash
cd flowcheq-mobile
yarn install
eas init          # links to Expo project, adds projectId to app.json
eas build:configure
```

Set production API URL (already in `eas.json` for preview/production):

```env
EXPO_PUBLIC_API_URL=https://api.estate.flowcheq.com
```

Or override in EAS secrets:

```bash
eas secret:create --name EXPO_PUBLIC_API_URL --value https://api.estate.flowcheq.com --scope project
```

---

## Step 2 — Android

### Option A — Google Play (recommended)

```bash
eas build --platform android --profile production
```

Produces an **AAB** (App Bundle). Upload to Play Console:

```bash
eas submit --platform android --profile production
```

Or upload the `.aab` manually in [Google Play Console](https://play.google.com/console).

On your website:

```html
<a href="https://play.google.com/store/apps/details?id=com.flowcheq.estate">
  Get Flowcheq Estate on Google Play
</a>
```

### Option B — Direct APK from your website

For agents who sideload (enable “Install unknown apps” for their browser):

```bash
eas build --platform android --profile production-apk
```

When the build finishes, download the `.apk` from the Expo dashboard.

Host it on your web repo, e.g.:

```
flowcheq-estate-web/public/downloads/flowcheq-estate-android.apk
```

Public URL:

```
https://estate.flowcheq.com/downloads/flowcheq-estate-android.apk
```

**Important:** Bump `version` and Android `versionCode` in `app.json` for every new APK you publish.

---

## Step 3 — iOS

Apple does **not** allow hosting an installable IPA on a normal website for general users.

### Option A — App Store (production)

```bash
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

Fill `eas.json` → `submit.production.ios` with your Apple ID, App Store Connect app ID, and team ID.

Website link:

```html
<a href="https://apps.apple.com/app/idYOUR_APP_ID">
  Download on the App Store
</a>
```

### Option B — TestFlight (beta agents)

Same `production` iOS build → submit to TestFlight. Share the public TestFlight link on your agent onboarding page until App Store review passes.

---

## Step 4 — Website download page

Add a page on **flowcheq-estate-web** (e.g. `/agents/app`) with:

- Short copy: “Official app for verified field agents”
- **Android:** Play Store badge + optional “Direct APK” link
- **iOS:** App Store badge (or TestFlight)
- QR codes pointing to those URLs (agents scan on phone)

Example env for the web build (no mobile code in web repo):

```env
VITE_ANDROID_PLAY_URL=https://play.google.com/store/apps/details?id=com.flowcheq.estate
VITE_ANDROID_APK_URL=https://estate.flowcheq.com/downloads/flowcheq-estate-android.apk
VITE_IOS_APP_STORE_URL=https://apps.apple.com/app/idXXXXXXXX
```

---

## Step 5 — Verify it works on both devices

Checklist before telling agents to install:

- [ ] `EXPO_PUBLIC_API_URL` points to **production** API (not localhost)
- [ ] Backend `CLIENT_ORIGIN` / CORS allows your web domain
- [ ] Agent can **log in** (JWT stored in secure store)
- [ ] **Camera + location** permissions granted
- [ ] **GPS capture upload** succeeds (`POST /houses/:id/photos/gps-capture`)
- [ ] Test on **physical** Android phone (multiple OEMs if possible)
- [ ] Test on **physical** iPhone (iOS 16+)
- [ ] New app version increments `version` in `app.json`

---

## Updating the app

1. Bump `expo.version` in `app.json` (and `android.versionCode` / iOS build number — EAS `autoIncrement` handles iOS/Android build numbers in production profile).
2. Re-run `eas build` for each platform changed.
3. Submit to stores or replace hosted APK.
4. Announce on agent dashboard / email.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| App can’t reach API | Wrong `EXPO_PUBLIC_API_URL`; must be HTTPS in production |
| iOS build fails signing | Run `eas credentials` and configure Apple certificates |
| Android “App not installed” | APK signature mismatch — uninstall old sideload first |
| Upload 401 | Agent not logged in; token expired |
| Store rejection (camera/location) | Permission strings in `app.json` → `ios.infoPlist` are already set; explain use in App Store review notes |

---

## Quick command reference

```bash
# Internal APK for testing
eas build -p android --profile preview

# Store-ready Android
eas build -p android --profile production

# Website-hosted APK
eas build -p android --profile production-apk

# Store-ready iOS
eas build -p ios --profile production
```
