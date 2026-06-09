# Daily Notes of Grace Release Status

Last updated: 2026-06-09

## Current Status

- Local release preflight: passing with `npm run check:local`.
- Hosted public pages: passing with `npm run check:public`.
- Final release gate: blocked by the latest EAS iOS App Store build status.
- Current app-source backup branch: `github/daily-notes-of-grace-release-candidate-2026-06-09`.
- App-source branch URL: `https://github.com/ndmr0/the-weak-christian/tree/daily-notes-of-grace-release-candidate-2026-06-09`.
- Local Git remote: `github` -> `https://github.com/ndmr0/the-weak-christian.git`.
- Public GitHub Pages commit: `71a9f7fc Update Daily Notes of Grace public pages`.

To verify the current local release-candidate commit:

```bash
git log -1 --oneline
```

To verify the remote release-candidate branch:

```bash
git ls-remote --heads github daily-notes-of-grace-release-candidate-2026-06-09
```

## Current EAS iOS Blocker

Latest iOS App Store build:

- Build ID: `ccbddfce-ed46-4f42-8049-75fbedcc0902`
- Build number: `2`
- Status: `ERRORED`
- Cause: the App Store provisioning profile for `com.theweakchristian.app` does not support Push Notifications and does not include the `aps-environment` entitlement.

This is an Apple provisioning issue, not an app-code issue. The app uses `expo-notifications` for the optional local daily reminder, so the iOS App Identifier and App Store provisioning profile must include Push Notifications.

## Next Required Action

Run:

```bash
npx eas-cli@latest credentials:configure-build --platform ios --profile production
```

When prompted, log in to Apple so EAS can regenerate or refresh the iOS App Store provisioning profile.

If EAS does not repair the provisioning profile automatically:

1. Open Apple Developer > Certificates, Identifiers & Profiles.
2. Open the App ID for `com.theweakchristian.app`.
3. Enable **Push Notifications** and save.
4. Regenerate or recreate the App Store provisioning profile for that App ID.
5. Return to EAS credentials and refresh the iOS build credentials.

Then run:

```bash
npx eas-cli@latest build --profile production --platform ios
```

## After A Successful iOS Build

1. Install the build through TestFlight.
2. Complete `testflight-qa-checklist.md` on a real iPhone.
3. Fill App Store Connect using:
   - `app-store-metadata.md`
   - `app-store-review-notes.md`
   - `app-store-privacy-answers.md`
   - `app-store-age-rating-answers.md`
   - `app-store-screenshots/`
4. Run `npm run check:release`.
5. Submit to Apple Review only after `npm run check:release` passes.

## Source-Control Notes

The repository's GitHub `main` branch is currently used for the public GitHub Pages site. Do not push the app source to `github/main`.

To back up app-source changes, push to the release-candidate branch:

```bash
git push github HEAD:refs/heads/daily-notes-of-grace-release-candidate-2026-06-09
```
