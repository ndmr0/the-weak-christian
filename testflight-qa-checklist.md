# TestFlight QA Checklist

Run this checklist on a real iPhone after the first EAS production build is installed through TestFlight.

## Install And First Launch

- Install the TestFlight build with a clean app state.
- Confirm the splash screen shows the wordmark clearly.
- Continue with a name and confirm the home dashboard greets that name.
- Delete/reinstall or clear app data, then confirm **Continue Without a Name** works.

## Home And Menu

- Confirm the home dashboard is visually calm, readable, and not clipped.
- Open the menu from the home screen.
- Confirm these menu rows open the expected screens:
  - Saved Notes
  - Recently Seen
  - My Reflections
  - My Prayers
  - Explore Scriptures
  - Topics & Themes
  - Encouragements
  - Profile
  - Settings
  - About
  - Privacy
  - Care Note
- Confirm **Reset Seen Notes** asks for confirmation and works.

## Today's Encouragement

- Open Today's encouragement.
- Swipe/scroll through at least 20 full-screen devotional pages.
- Confirm every page keeps the same skeleton:
  - logo
  - menu button
  - devotional card
  - scripture box
  - bottom action tray
- Confirm no encouragement text is clipped.
- Confirm no scripture text is clipped.
- Confirm the bottom action labels never wrap.
- Save and unsave a note.
- Use Reflect, Pray, and Share from the bottom action tray.

## Saved Notes

- Save at least 3 notes from Today's encouragement.
- Open Saved Notes.
- Search saved notes.
- Filter saved notes.
- Favorite a saved note.
- Add a personal note.
- Remove a saved note.
- Confirm saved notes persist after force-closing and reopening the app.

## Reflections

- Create a reflection from Today's encouragement.
- Create a reflection from the home daily rhythm card.
- Add title and body text.
- Link an encouragement by search.
- Save, reopen, edit, and delete a reflection.
- Confirm blank reflections cannot be saved.

## Prayers

- Create a prayer from Today's encouragement.
- Create a prayer from the home daily rhythm card.
- Add title, body, and category.
- Mark prayed today.
- Mark answered and then active again.
- Edit and delete a prayer request.
- Confirm blank prayer requests cannot be saved.

## Explore And Recently Seen

- Search Explore by verse reference.
- Search Explore by theme or phrase.
- Open a result and use Save, Reflect, Pray, and Share.
- Open Recently Seen and confirm recently viewed notes appear in newest-first order.

## Share Flow

- Share with a recipient name.
- Share without a recipient name.
- Confirm the native iOS share sheet opens.
- Cancel the share sheet and confirm the app remains stable.

## Profile And Local Data Controls

- Edit the profile name and confirm future notes use the new name.
- Confirm the privacy summary says data stays local.
- Confirm the care note is visible.
- Clear saved notes and confirm it asks for confirmation.
- Reset seen notes and confirm Today's encouragement starts fresh.

## Accessibility And Device Checks

- Enable larger text sizes and inspect the main screens for clipping.
- Enable VoiceOver and confirm buttons have meaningful labels.
- Rotate the device and confirm the app remains portrait.
- Confirm the app does not request permissions for location, camera, microphone, contacts, photos, or notifications.

## Final Pass Criteria

- No crashes.
- No clipped devotional content.
- No broken navigation paths.
- No stale donation/support language.
- No account, ads, analytics, or tracking prompts.
- `npm run check:release` passes before App Store submission.
