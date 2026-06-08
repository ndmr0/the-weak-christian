# Daily Notes of Grace App Store Checklist

## Ready In The App

- Wordmark icon generated at `assets/icon.png`, `assets/adaptive-icon.png`, and `assets/logo-mark.png`, matching the first screen style.
- Profile screen includes name editing, privacy summary, care note, reset seen notes, and clear saved notes.
- App menu includes Saved Notes, Recently Seen, My Reflections, My Prayers, Explore, Profile, About, Privacy, Care Note, and Reset Seen Notes.
- Saved notes can be removed from the saved screen.
- Journal reflections and prayer requests are stored locally and handle persistence errors gracefully.
- Share flow uses a preview screen, optional recipient name, app branding, and the native share sheet.
- Feed uses local seen-note history so each app open prioritizes fresh notes.
- Today reader uses 908 layout-safe notes from the 1,000-record source database.
- User data stays local in AsyncStorage. There are no accounts, ads, analytics, or tracking.
- App-level iOS privacy manifest declares no tracking and no collected data types.
- Store/review checks are available through `npm run check:store`, `npm run check:flow`, `npm run check:today`, `npm run check:review`, and `npm run check:submit`.
- Public App Store URL content can be verified with `npm run check:public`.
- Local preflight is available through `npm run check:local`.
- Full release preflight is available through `npm run check:release` after public pages are deployed.
- Public pages can be packaged for deployment with `npm run package:public-pages`.
- TestFlight real-device review checklist is available in `testflight-qa-checklist.md`.
- Final release sequence is documented in `release-runbook.md`.
- Current review handoff summary is available in `review-handoff.md`.
- App Store privacy answers are documented in `app-store-privacy-answers.md`.
- App Store age rating guidance is documented in `app-store-age-rating-answers.md`.

## Still Needed Before Submission

- Public HTTPS URLs listed in `app-store-metadata.md` return HTTP 200, but the hosted pages are stale as of 2026-05-30.
- Deploy the current `github-pages-site/` files so `npm run check:public` passes before App Store submission.
- Add the hosted privacy, support, and marketing URLs in App Store Connect.
- Confirm `com.theweakchristian.app` is available in the Apple Developer account, or update `app.json` before the first production build.
- Review the generated App Store screenshot drafts in `app-store-screenshots/`; replace with real simulator/device screenshots if you want exact runtime captures.
- Run an EAS production build, install through TestFlight, and complete `testflight-qa-checklist.md`.
- Complete Apple privacy nutrition labels using `app-store-privacy-answers.md`.
- Complete Apple age rating using `app-store-age-rating-answers.md`.
