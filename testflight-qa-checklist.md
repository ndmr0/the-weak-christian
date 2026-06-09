# TestFlight QA Checklist

Run this checklist on a real iPhone after the first EAS production build is installed through TestFlight.

## Install And First Launch

- Install the TestFlight build with a clean app state.
- Confirm the splash screen shows the wordmark clearly.
- Continue with a name and confirm the first daily check-in uses that name.
- Delete/reinstall or clear app data, then confirm **Continue Without a Name** works.

## Check-In And Menu

- Confirm the **Check in** screen is visually calm, readable, and not clipped.
- Confirm the mood options are visible, evenly distributed, and selectable.
- Confirm the **Next** button is disabled until a choice is selected.
- Complete the mood, social mood, sleep, and gratitude steps.
- Confirm **Skip** on the gratitude step still opens encouragement.
- Open the menu from the Check in or Mood Tracker screen.
- Confirm these menu rows open the expected screens:
  - My Notes
  - Recently Seen
  - Mood Tracker
  - Journal
  - Prayer
  - Browse Scripture
  - Profile
  - About
  - Privacy
  - Care Note
- Confirm menu opening and closing feels immediate.

## Encouragement After Check-In

- Complete a check-in and confirm an encouragement opens.
- Confirm the note appears softly and is readable in digestible chunks.
- Confirm the Scripture section appears and is fully visible.
- Confirm no encouragement text is clipped.
- Confirm no Scripture text is clipped.
- Confirm Save, Reflect, Share, and Next encouragement work.
- Save and unsave a note.
- Use Reflect and Share from the encouragement actions.
- Use **Next encouragement** at least 10 times and confirm each note remains contained.

## Mood Tracker

- After completing today's check-in, close and reopen the app.
- Confirm the default screen is **Mood Tracker**, not Check in.
- Tap **Check in** and confirm the user can still manually start another check-in.
- Confirm the heat map fills the card without excessive blank space.
- Tap several heat-map days and confirm the selected-day detail updates.
- Confirm mood, social mood, sleep, and gratitude sections match the available data.
- Confirm the Thankfulness journal hides gracefully when there are no gratitude entries.

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

- Create a reflection from an encouragement.
- Add title and body text.
- Link an encouragement by search.
- Save, reopen, edit, and delete a reflection.
- Confirm blank reflections cannot be saved.

## Prayers

- Create a prayer request from the menu or Prayer screen.
- Add title, body, and category.
- Mark prayed today.
- Mark answered and then active again.
- Edit and delete a prayer request.
- Confirm blank prayer requests cannot be saved.

## Explore And Recently Seen

- Search Browse Scripture by verse reference.
- Search Browse Scripture by theme or phrase.
- Open a result and use Save, Reflect, Pray, and Share.
- Open Recently Seen and confirm recently viewed notes appear in newest-first order.
- Open a Recently Seen item and confirm it uses the same encouragement screen as Check in.

## Share Flow

- Share with a recipient name.
- Share without a recipient name.
- Confirm the native iOS share sheet opens.
- Cancel the share sheet and confirm the app remains stable.

## Profile And Local Data Controls

- Edit the profile name and confirm future notes use the new name.
- Confirm the privacy summary says data stays local.
- Confirm the care note is visible.
- Turn the optional daily reminder on and off.
- Choose a reminder time and confirm the selected time is shown.
- Clear saved notes and confirm it asks for confirmation.
- Reset seen notes and confirm Today's encouragement starts fresh.

## Accessibility And Device Checks

- Enable larger text sizes and inspect the main screens for clipping.
- Enable VoiceOver and confirm buttons have meaningful labels.
- Rotate the device and confirm the app remains portrait.
- Confirm the app does not request permissions for location, camera, microphone, contacts, or photos.
- Confirm notification permission is requested only when the daily reminder is turned on.

## Final Pass Criteria

- No crashes.
- No clipped devotional content.
- No broken navigation paths.
- No stale donation/support language.
- No account, ads, analytics, or tracking prompts.
- `npm run check:release` passes before App Store submission.
