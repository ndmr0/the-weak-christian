# Release Runbook

Use this runbook after the app is approved for review by Nelson and before App Store submission.

## 1. Local Preflight

Run:

```bash
npm run check:local
```

This packages public pages, regenerates screenshot drafts, validates data, checks app flows, checks encouragement-page fit, checks review assets, checks store readiness, and checks submission docs/config.

## 2. Public Pages

Package the public pages:

```bash
npm run package:public-pages
```

Deploy only:

```txt
dist/github-pages-site/.nojekyll
dist/github-pages-site/index.html
dist/github-pages-site/privacy-policy.html
dist/github-pages-site/support.html
```

From an authenticated GitHub checkout of `ndmr0/the-weak-christian`, copy those four files to the repository root, commit, and push `main`.

The prepared patch can be checked locally with:

```bash
npm run check:pages-patch
```

Then run:

```bash
npm run check:public
```

Do not continue until it passes.

## 3. Bundle Identifier

Confirm `com.theweakchristian.app` is available in the Apple Developer account. If it is not available, update:

```txt
app.json -> expo.ios.bundleIdentifier
app.json -> expo.android.package
```

Then rerun:

```bash
npm run check:submit
```

## 4. Platform Exports

Run:

```bash
npm run check:ios
npm run check:android
```

Both must export successfully.

## 5. EAS Production Build

Use a current external EAS CLI. Do not add `eas-cli` as a local dependency.

Before rebuilding iOS, confirm the Apple Developer App Identifier and App Store provisioning profile for `com.theweakchristian.app` include Push Notifications. The optional local reminder is implemented with `expo-notifications`, which causes the iOS build to require the `aps-environment` entitlement.

If a production iOS build fails with a message that the provisioning profile does not support Push Notifications or does not include `aps-environment`, log in to Apple through EAS credentials and regenerate the App Store provisioning profile:

```bash
npx eas-cli@latest credentials:configure-build --platform ios --profile production
```

Recommended commands:

```bash
npx eas-cli@latest build --profile production --platform ios
npx eas-cli@latest build --profile production --platform android
```

Install the iOS build through TestFlight before sending the build to Apple Review.

## 6. TestFlight QA

Complete:

```txt
testflight-qa-checklist.md
```

Every final pass criterion must be true before submission.

## 7. App Store Connect

Use:

```txt
app-store-metadata.md
app-store-review-notes.md
app-store-screenshots/
app-store-privacy-answers.md
app-store-age-rating-answers.md
```

Privacy nutrition labels should be **Data Not Collected** unless new networked or tracking features are added later.

## 8. Final Gate

Run:

```bash
npm run check:release
```

This runs the local checks, hosted public-page checks, platform exports, high-severity dependency audit, and latest EAS iOS App Store build status check.

Submit only after this command passes. If the command reports that the latest iOS App Store build is errored, fix the EAS/Apple build issue, rebuild, complete TestFlight QA, and run this gate again.
