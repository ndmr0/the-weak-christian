# Daily Notes of Grace Review Handoff

Generated: 2026-05-30

## Current App State

- App name: Daily Notes of Grace
- Version: 1.0.0
- Expo SDK: ~54.0.35
- iOS bundle identifier: com.theweakchristian.app
- Android package: com.theweakchristian.app
- EAS project ID: 746c00f2-87af-4756-86fb-50282cd0dce3
- Source encouragement records: 1000
- Layout-safe Today reader notes: 908
- Data model: bundled KJV encouragement records, local-only AsyncStorage user data
- Privacy posture: no account, no ads, no analytics, no tracking, no backend

## Main User Experience

- Splash screen with Daily Notes of Grace wordmark
- Optional name personalization
- Daily Check in flow that leads into Today's Encouragement
- Mood Tracker with local mood, social, sleep, and thankfulness history
- Static bottom navigation for Check in, Mood Tracker, My Notes, and Profile
- Menu with My Notes, Recently Seen, Mood Tracker, Journal, Prayer, Browse Scripture, Profile, About, Privacy, and Care Note
- Saved notes with personal note text and favorites
- Local journal reflections
- Local prayer requests
- Explore/search by verse, phrase, and theme
- Share preview using the native share sheet

## Local Verification Gate

Run:

```bash
npm run check:local
```

This verifies:

- Public-page deployment package generation
- App Store screenshot draft generation
- 1,000-record data validation
- App flow and persistence safeguards
- Accessibility labels on button controls
- Today-page fixed-layout fit for 908 notes across 3 device profiles
- Review screenshot assets
- Store readiness configuration
- Submission docs and config

Latest local status: passing.

## Public Page Deployment Package

Deploy the generated files from:

```txt
dist/github-pages-site/
```

Expected files:

```txt
.nojekyll
index.html
privacy-policy.html
support.html
```

Deploy them to the root of `ndmr0/the-weak-christian` on GitHub Pages, then push `main`.

The prepared patch can be verified before deployment with:

```bash
npm run check:pages-patch
```

After deploying, run:

```bash
npm run check:public
```

Current public status: failing because the hosted GitHub Pages site is stale.

Known hosted-page failures:

- Hosted privacy policy still includes the removed External Links section.
- Hosted support page does not match current app navigation language.
- Hosted support page still includes donation/Ko-fi language.
- Hosted support page still includes an external URL.

## App Store Review Assets

Screenshot drafts:

- app-store-screenshots/01-opening-wordmark.png
- app-store-screenshots/02-home-dashboard.png
- app-store-screenshots/03-todays-encouragement.png
- app-store-screenshots/04-burger-menu.png
- app-store-screenshots/05-reflect-and-pray.png

Metadata and forms:

- app-store-metadata.md
- app-store-review-notes.md
- app-store-privacy-answers.md
- app-store-age-rating-answers.md

QA and release:

- testflight-qa-checklist.md
- release-runbook.md
- app-store-checklist.md

## Final Release Gate

Run:

```bash
npm run check:release
```

This must pass before App Store submission. It currently stops at `npm run check:public` until the public pages are deployed.

## Remaining External Steps

1. Deploy `dist/github-pages-site/` to GitHub Pages.
2. Confirm `npm run check:public` passes.
3. Confirm `com.theweakchristian.app` is available in Apple Developer.
4. Run iOS and Android platform export checks.
5. Build production with EAS.
6. Install iOS build through TestFlight.
7. Complete `testflight-qa-checklist.md`.
8. Fill App Store Connect using the metadata, privacy, and age-rating files.
9. Run `npm run check:release`.
10. Submit to Apple after the final gate passes.
