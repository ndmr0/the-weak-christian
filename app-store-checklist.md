# The Weak Christian App Store Checklist

## Ready In The App

- Wordmark icon generated at `assets/icon.png`, `assets/adaptive-icon.png`, and `assets/logo-mark.png`, matching the first screen style.
- Profile screen includes name editing, privacy summary, care note, reset seen notes, and clear saved notes.
- Saved notes can be removed from the saved screen.
- Share flow uses a preview screen, optional recipient name, app branding, and the native share sheet.
- Feed uses local seen-note history so each app open prioritizes fresh notes.
- User data stays local in AsyncStorage. There are no accounts, ads, analytics, or tracking.

## Still Needed Before Submission

- Host `privacy-policy.html` and `support.html` at public HTTPS URLs.
- Add those hosted URLs in App Store Connect.
- Confirm the final Apple Developer bundle identifier in `app.json`.
- Create App Store screenshots from the iPhone simulator or a real device.
- Run an EAS production build, install through TestFlight, and test onboarding, scrolling, saving, removing, sharing, reset seen notes, and clear saved notes.
- Complete Apple privacy nutrition labels as no data collected, unless new features are added later.
