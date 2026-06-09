# Daily Notes of Grace

Expo React Native app for a calm, Christ-centered devotional experience built around the bundled KJV encouragement database.

## Current Flow

1. Splash screen with the wordmark.
2. Name screen with optional user name.
3. Daily Check in flow for mood, social mood, sleep, and optional gratitude.
4. Context-matched encouragement note after check-in.
5. Mood Tracker becomes the default screen after the day’s check-in is complete.
6. Static bottom navigation: Check in, Mood Tracker, My Notes, and Profile.
7. Burger menu with My Notes, Recently Seen, Mood Tracker, Journal, Prayer, Browse Scripture, Profile, About, Privacy, and Care Note.
8. Saved encouragements, journal reflections, prayer requests, browse/search, and share preview flows.
9. Profile area with privacy summary, care note, optional daily reminder controls, reset seen notes, and clear saved notes.

If a user enters a name, each note renders with that name. If not, the app uses `Christian`.

## Fresh Content Logic

The app stores seen encouragement IDs locally with AsyncStorage. After a check-in, it builds the encouragement pool from layout-safe notes the user has not seen yet, then scores notes by mood, social mood, sleep state, pastoral intent, tone, doctrinal emphasis, and length safety. The source database contains 1,000 records; the reader uses the layout-safe subset that passes the fixed-page fit audit for the current user name. When all eligible notes have been seen, the app resets the local seen list and starts a new shuffled cycle.

The user's name, check-ins, reminder setting, and seen-note history stay on the device.

Saved encouragements, journal reflections, and prayer requests also stay on the device for this first version.

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
  "translation": "KJV",
  "moods": ["Anxious"],
  "socialMoods": ["Withdrawn"],
  "sleepStates": ["Poor"],
  "pastoralIntent": "comfort",
  "doctrinalEmphasis": ["Christ's sufficiency"],
  "tone": "gentle",
  "intensity": "high-need",
  "lengthTier": "screen-safe"
}
```

## Local Commands

```bash
npm install
npx expo start
```

Readiness checks:

```bash
npm run check:local
npm run package:public-pages
npm run create:screenshots
npm test
npm run check:flow
npm run check:today
npm run check:review
npm run check:store
npm run check:submit
npm run check:ios
npm run check:android
```

Full release gate, including public App Store URLs and platform exports:

```bash
npm run check:release
```

`npm run check:release` is expected to fail until the current `github-pages-site/` files are deployed and `npm run check:public` passes.

Package the current public pages for deployment:

```bash
npm run package:public-pages
```

This creates `dist/github-pages-site/` from the current `github-pages-site/` folder.

To regenerate the bundled app data after editing the JSONL:

```bash
node scripts/convert-data.mjs
node scripts/validate-data.mjs
```

## App Store Notes

Before submitting to Apple, update the `ios.bundleIdentifier` in `app.json` to the final Apple Developer account bundle ID.

This project currently uses Expo SDK 54 for the most reliable Expo Go preview on iPhone.

`app.json` includes an app-level iOS privacy manifest with no tracking, no collected data types, and required-reason API declarations matching the installed React Native/Expo native packages.

Use a current external EAS CLI for cloud builds/submission rather than pinning `eas-cli` in this app's local dev dependencies.

Host `privacy-policy.html` and `support.html` at public HTTPS URLs before filling out App Store Connect.

Use `app-store-review-notes.md` as the starting point for App Store Connect review notes.

Use `testflight-qa-checklist.md` for the real-device TestFlight pass before submission.

Use `app-store-privacy-answers.md` and `app-store-age-rating-answers.md` when completing App Store Connect privacy and age rating forms.

Use `release-runbook.md` for the final sequence from local checks to public pages, EAS build, TestFlight QA, and App Store Connect submission.

Use `review-handoff.md` as the single current-state summary for Nelson's app review.
