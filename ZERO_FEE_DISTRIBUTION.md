# Zero-fee agent distribution (no App Store / Play Console fees)

How to get agents on **Android and iPhone** from your website **without** paying Apple ($99/yr) or Google Play ($25).

---

## The honest platform rules

| Platform | Native app from your website for free? | What actually works for $0 |
|----------|----------------------------------------|----------------------------|
| **Android** | **Yes** — signed **APK** hosted on your site | Agents tap Download → install once (allow “unknown apps”) |
| **iPhone** | **No** — Apple **blocks** IPA files from websites | **PWA**: open site in Safari → **Add to Home Screen** (free, no Apple account) |

There is **no certificate trick** that lets random iPhones install a native `.ipa` from `estate.flowcheq.com` without Apple Developer Program. Enterprise ($299/yr) is for **employees only** — Apple revokes accounts used for public/agent sideloading.

**Our approach:** Android gets a **release-signed APK**. iPhone gets the **same web app as an icon** (PWA) — camera + GPS work in Safari over HTTPS.

---

## Android — free APK (release-signed)

### Cost

- **$0** — Expo EAS free tier includes Android builds + keystore management (monthly build limits apply).
- **No Google Play Console** required for website APK.

### One-time setup

```bash
cd flowcheq-mobile
yarn install
npm install -g eas-cli
eas login          # free Expo account
eas init
```

Generate a **release keystore** (EAS stores it — do not lose access to your Expo account):

```bash
eas credentials -p android
# Choose: Set up new keystore → Let EAS manage
```

### Build the APK

```bash
eas build -p android --profile production-apk
```

When finished, download the `.apk` from the Expo dashboard.

### Host on your website

Copy to the **web** repo:

```
flowcheq-estate-web/public/downloads/flowcheq-estate-android.apk
```

Public URL:

```
https://estate.flowcheq.com/downloads/flowcheq-estate-android.apk
```

Deploy the web app. Link from **https://estate.flowcheq.com/agents/app**.

### What agents see (normal, not a bug)

1. Tap **Download APK**
2. Android asks to **allow install from Chrome/browser** (one-time per browser)
3. **Google Play Protect** may say “Scanning app…” — tap **Install anyway** for your signed release build
4. Open app → sign in as agent

**Why it’s trustworthy:** APK is signed with your **release keystore**, not a debug key. Same signing model as Play Store apps — you’re just skipping the store.

### Updating

Bump `expo.version` in `app.json`, rebuild APK, replace file on the website, tell agents to reinstall (or use same package name + higher versionCode for in-place upgrade).

---

## iPhone — free PWA (Add to Home Screen)

Apple does not allow hosting an installable native app. The **free** official pattern is a **Progressive Web App**:

1. Agent opens **Safari** → `https://estate.flowcheq.com/agents/app`
2. Tap **Share** → **Add to Home Screen**
3. Icon appears like an app; opens full-screen
4. Sign in at `/auth` → use **Agent dashboard** on mobile web

### Requirements (already on your site)

- Site served over **HTTPS** (`estate.flowcheq.com`)
- `manifest.webmanifest` + Apple meta tags (in web repo)
- Camera/location: Safari prompts when capture features run (HTTPS required)

### Agent instructions (put on `/agents/app`)

1. Use **Safari** (not Chrome on iOS for best PWA support)
2. Go to `estate.flowcheq.com/agents/app`
3. Share → **Add to Home Screen** → Add
4. Open **Flowcheq Estate** from home screen
5. Log in as agent

**Limitation vs native app:** iOS may suspend background GPS more aggressively; agents should keep Safari/PWA in foreground while capturing. For heavy field capture, native iOS eventually needs Apple Developer ($99/yr) — optional later.

---

## Comparison

| | Android APK | iPhone PWA |
|---|-------------|------------|
| Cost | $0 | $0 |
| Download from site | Direct `.apk` link | Add to Home Screen (no file download) |
| Signing / trust | Release keystore via EAS | HTTPS + Apple PWA trust model |
| Store account | Not required | Not required |
| “Install blocked” complaints | Minimal if release-signed | None (not sideloading) |

---

## Quick commands

```bash
# Android APK (free, website hosting)
eas build -p android --profile production-apk

# Do NOT use for public iPhone sideload (requires paid Apple account):
# eas build -p ios --profile production
```

---

## When you’re ready to pay (optional upgrade)

| Account | Cost | Unlocks |
|---------|------|---------|
| Apple Developer | $99/year | App Store, TestFlight, native iOS IPA |
| Google Play Console | $25 once | Play Store listing (fewer sideload warnings) |

Until then, **Android APK + iPhone PWA** is the correct zero-fee setup.
