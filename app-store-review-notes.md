# Daily Notes of Grace App Store Review Notes

## App Summary

Daily Notes of Grace is a simple devotional app for Christ-centered encouragement. The app starts with a daily check-in, then presents short encouragement notes paired with King James Version Bible verses. Users can track mood patterns locally, save notes, write private reflections, keep prayer requests, search themes, set an optional local daily reminder, and share encouragement text through the native share sheet.

The app bundles 1,000 encouragement records. The encouragement reader uses the layout-safe subset that passes the fixed-page layout audit for the current user name so devotional text and Scripture remain visible without clipping.

## Review Instructions

No account is required.

On first launch, enter any name or choose **Continue Without a Name**. The main app tabs are **Check in**, **Mood Tracker**, **My Notes**, and **Profile**. Complete the Check in flow to receive an encouragement note, or use **Mood Tracker** to review local mood, social, sleep, and thankfulness history. Use the menu button to access My Notes, Recently Seen, Mood Tracker, Journal, Prayer, Browse Scripture, Profile, About, Privacy, and Care Note.

## Privacy

The app does not use accounts, ads, analytics, tracking, location, camera, microphone, contacts, photos, or a backend service.

The app includes an optional daily reminder. If the user turns it on, the app requests notification permission and schedules a local device reminder. The app does not upload push tokens, send user data to a server, or use notifications for tracking.

The app stores the following locally on the user's device:

- Optional display name
- Mood check-in entries
- Saved encouragement IDs
- Personal saved-note text
- Recently seen note IDs
- Journal reflections
- Prayer requests
- Daily reminder hour, if enabled

This data is not sent to the developer by the app.

## Care Note

The app includes a clear care note: the devotional notes are for spiritual encouragement and are not a replacement for pastoral, medical, mental health, or emergency care.

## Build Notes

The app is configured as an Expo SDK 54 project. `app.json` includes `ITSAppUsesNonExemptEncryption: false` and an iOS privacy manifest declaring no tracking and no collected data types.

## Local Verification Commands

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

The full release gate is:

```bash
npm run check:release
```

It should pass after the public GitHub Pages files are deployed and `npm run check:public` passes.

Real-device TestFlight QA is tracked in:

```bash
testflight-qa-checklist.md
```
