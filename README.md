# The Weak Christian

Minimal Expo React Native app for an infinite-scrolling encouragement feed.

## Current Flow

1. Splash screen with the wordmark.
2. Name screen with optional user name.
3. Infinite encouragement feed using the bundled KJV database.
4. Local profile screen to update the display name.
5. Saved encouragements screen.
6. Share preview screen with app branding and an optional recipient name before opening the iOS share sheet.
7. Profile area with privacy summary, care note, reset seen notes, and clear saved notes.

If a user enters a name, each note renders with that name. If not, the app uses `Christian`.

## Fresh Content Logic

The app stores seen encouragement IDs locally with AsyncStorage. On each app open, it builds the feed from notes the user has not seen yet. When all 1,000 notes have been seen, the app resets the local seen list and starts a new shuffled cycle.

The user's name and seen-note history stay on the device.

Saved encouragements also stay on the device for this first version.

## Data

The app bundles `src/data/encouragements.json`, converted from `encouragements_kjv_1000.jsonl`.

Each record uses:

```json
{
  "id": 1,
  "encouragement_template": "{name}, ...",
  "fallback_name": "Christian",
  "verse_text": "...",
  "verse_reference": "...",
  "translation": "KJV"
}
```

## Local Commands

```bash
npm install
npx expo start
```

To regenerate the bundled app data after editing the JSONL:

```bash
node scripts/convert-data.mjs
node scripts/validate-data.mjs
```

## App Store Notes

Before submitting to Apple, update the `ios.bundleIdentifier` in `app.json` to the final Apple Developer account bundle ID.

This project currently uses Expo SDK 54 for the most reliable Expo Go preview on iPhone.

Host `privacy-policy.html` and `support.html` at public HTTPS URLs before filling out App Store Connect.
