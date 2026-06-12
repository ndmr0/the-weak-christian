# Daily Notes of Grace

## User Experience Product Requirements Document

**Document type:** UX-only product requirements document  
**Product:** Daily Notes of Grace  
**Platform:** Mobile application, designed primarily for iPhone  
**Version:** 1.0 product experience  
**Audience:** Product designer, UX designer, content designer, and application developer  
**Status:** Developer handoff specification  
**Last updated:** June 13, 2026

---

## 1. Purpose Of This Document

This document defines the complete user experience for Daily Notes of Grace.

It explains:

- Who the product serves.
- What the product should help users accomplish.
- The complete user journey.
- The information architecture.
- Every primary and secondary feature.
- Every screen and the UI elements that belong on it.
- The expected behavior of controls, navigation, empty states, confirmations, and transitions.
- The theological and pastoral standards for encouragement content.
- Accessibility, privacy, and emotional-safety requirements.

This document intentionally does not prescribe programming languages, frameworks, storage libraries, database structures, or other implementation details.

---

## 2. Product Summary

Daily Notes of Grace is a private, Christ-centered devotional application that helps a user:

1. Briefly identify how they are feeling.
2. Receive a relevant encouragement grounded in Scripture.
3. Notice patterns in mood, social energy, sleep, and gratitude.
4. Save meaningful encouragements.
5. Write private reflections.
6. keep a private prayer list.
7. Return to previously read notes.
8. Share an encouragement with another person.

The product should feel like a quiet devotional companion, not a clinical mood-monitoring application, social network, productivity dashboard, or generic motivational app.

The central promise is:

> A simple daily check-in that leads the user's heart back to Jesus through Scripture-centered encouragement.

---

## 3. Product Positioning

### 3.1 What The Product Is

- A calm daily Christian check-in.
- A source of short, personalized encouragement.
- A Scripture-first devotional tool.
- A private record of mood patterns and gratitude.
- A place to save notes, reflect, and pray.
- A product that works without an account.

### 3.2 What The Product Is Not

- A mental health diagnosis tool.
- A substitute for pastoral, medical, psychological, or emergency care.
- A social network.
- A public journal.
- A Bible replacement.
- A prosperity-gospel or positive-thinking product.
- A generic affirmation application.
- A tool that grades, shames, or pressures spiritual performance.

---

## 4. Theological And Pastoral Direction

All devotional content must be:

- Explicitly Christian.
- Christ-centered.
- Gospel-oriented.
- Scripture-grounded.
- Consistent with a Reformed or Calvinistic understanding of grace, providence, human weakness, Christ's sufficiency, and God's faithfulness.
- Pastoral rather than clinical.
- Gentle without becoming vague.
- Hopeful without making promises Scripture does not make.

### 4.1 Preferred Encouragement Pattern

Each note should generally:

1. Name the user's condition gently.
2. Show that the condition is not beyond God's care.
3. Ground comfort in Christ, grace, Scripture, God's character, or God's promises.
4. Offer one simple faithful response, such as rest, pray, trust, repent, ask, endure, worship, or take the next faithful step.

### 4.2 Content To Avoid

Do not use:

- "Believe in yourself" language.
- "You are enough by yourself" language.
- Manifestation language.
- Prosperity guarantees.
- Claims that faith removes all suffering.
- Commands that imply the user earns God's acceptance.
- Heavy exhortation for an exhausted, anxious, numb, or overwhelmed user.
- Shame-based streaks, warnings, or missed-day messages.
- Clinical claims based on mood answers.

### 4.3 Scripture

- Every encouragement must be paired with a Bible verse.
- The product's primary translation is the King James Version.
- Scripture must remain visually distinct from the original encouragement.
- Verse text and reference must be fully visible whenever the full encouragement is presented.
- Scripture should not be reduced to decoration or used out of context merely because a keyword matches.

---

## 5. Target Users

### 5.1 Primary User

A Christian adult who wants a short, private, spiritually grounded daily practice and may be:

- Discouraged.
- Tired.
- Anxious.
- Lonely.
- Confused.
- Afraid.
- Overwhelmed.
- Emotionally numb.
- Calm.
- Hopeful.
- Joyful.
- Thankful.

### 5.2 Secondary Users

- Christians who want to notice emotional and spiritual patterns over time.
- Users who want a simple private gratitude record.
- Users who save devotional notes for later.
- Users who journal after reading Scripture.
- Users who keep prayer requests and record answered prayer.
- Users who want to share a brief encouragement with family or friends.

### 5.3 User Needs

The user needs to feel:

- Welcomed without being forced to create an account.
- Understood without being clinically analyzed.
- Guided without being overwhelmed by choices.
- Spiritually encouraged rather than merely emotionally soothed.
- In control of their private information.
- Free to skip optional writing.
- Able to revisit meaningful content.
- Confident that navigation will remain stable and predictable.

---

## 6. Core Jobs To Be Done

### Daily Check-In Job

> When I begin my day, I want to quickly acknowledge how I am doing so that I can receive an encouragement that feels relevant and points me to Christ.

### Pattern Awareness Job

> When I have used the app for several days, I want to notice patterns in my mood, social energy, sleep, and gratitude without feeling judged.

### Retention Job

> When an encouragement matters to me, I want to save it and add a private note so I can return to it later.

### Reflection Job

> When a note or verse makes me think, I want a private place to write what I am learning.

### Prayer Job

> When I have a concern or answer to prayer, I want to record it and return to it intentionally.

### Sharing Job

> When someone else may need encouragement, I want to personalize and share the note simply.

---

## 7. Experience Principles

### 7.1 Calm Before Clever

The app should feel quiet, steady, and easy to understand. Visual novelty must never interfere with reading.

### 7.2 Scripture Is The Anchor

The encouragement may introduce the pastoral idea, but Scripture must remain the final authority and visual destination.

### 7.3 One Main Decision At A Time

The check-in should present one question at a time. Major screens should have one obvious primary action.

### 7.4 No Guilt Mechanics

Streaks and history may help users notice consistency, but the app must never shame missed days or imply spiritual failure.

### 7.5 Private By Default

No content is public. The product should repeatedly communicate that the user's name, check-ins, saved notes, reflections, prayers, and reading history remain private on the device.

### 7.6 Stable Navigation

The top navigation and bottom navigation must remain in the same visual position across the main application. Page content changes between them; the navigation should not jump, scroll away, or change dimensions.

### 7.7 Content Must Fit The Experience

The product should use content written for the screen rather than damaging readability through clipping, ellipses, or extreme font reduction.

### 7.8 Motion Must Support Reading

Motion should be soft and optional. It must not move content from one position to another after the user has begun reading.

---

## 8. Information Architecture

### 8.1 Primary Navigation

The persistent bottom navigation contains four destinations:

1. **Check in**
2. **Mood Tracker**
3. **My Notes**
4. **Profile**

### 8.2 Secondary Navigation

The top-right menu provides access to:

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
- Reset reading history

### 8.3 Content Relationships

- A completed check-in leads to an encouragement.
- An encouragement can be saved.
- An encouragement can start a reflection.
- An encouragement can start a prayer.
- An encouragement can be shared.
- Saved, recently seen, and browse results must all open the same encouragement-reading experience.
- Journal entries and prayer requests may be linked to an encouragement.
- Mood Tracker receives completed check-in entries.

---

## 9. Global App Shell

The main application uses one stable shell around changing page content.

### 9.1 Top Navigation

The top navigation contains:

- Daily Notes of Grace wordmark on the left.
- Circular menu button on the right.

Requirements:

- It remains in the same position on all main screens.
- It respects the device safe area.
- The wordmark must never clip.
- The menu button must never sit behind page content.
- The menu opens immediately.
- Page scrolling occurs beneath the fixed top area.

### 9.2 Bottom Navigation

The bottom navigation contains four evenly distributed items:

- Check in
- Mood Tracker
- My Notes
- Profile

Each item contains:

- A relevant line icon.
- A short label.
- A full-item tap area.
- A selected state.

Requirements:

- It remains anchored in the same position on all main screens.
- It must not cover scrollable content.
- Labels must never wrap unpredictably.
- The selected destination uses a subtle accent treatment.
- Press feedback is restrained and immediate.
- The navigation must not visibly move when the user changes screens.

### 9.3 Content Area

The content area:

- Begins below the top navigation.
- Ends above the bottom navigation.
- Scrolls only when content genuinely exceeds the available area.
- Includes sufficient bottom spacing so the final item is never hidden behind navigation.

### 9.4 Visual Language

The visual system should feel:

- Calm.
- Premium.
- Devotional.
- Modern.
- Editorial.
- Warm.
- Clear.

Preferred characteristics:

- Warm near-white or very light lavender backgrounds.
- Purple or indigo as the primary accent rather than the entire interface.
- Black or deep charcoal for major headings.
- Muted purple-gray for secondary text.
- White or lightly tinted cards.
- Soft borders and restrained shadows.
- Serif typography for devotional and Scripture reading.
- Sans-serif typography for navigation, controls, labels, and headings.
- Consistent line icons.
- Moderate corner radii.

Avoid:

- Large areas of saturated purple.
- Every button using the same strong purple fill.
- Excessive gradients.
- Decorative elements competing with Scripture.
- Deeply nested cards.
- Oversized headings inside compact cards.
- Blank fixed-height areas.

---

## 10. Core User Flows

## 10.1 First Launch

1. User opens the app.
2. Splash screen displays the Daily Notes of Grace wordmark.
3. Name screen asks for the user's name.
4. User either enters a name or chooses **Continue Without a Name**.
5. The app opens the first Daily Check-In.
6. The user completes mood, social mood, sleep, and optional gratitude.
7. The app presents a context-matched encouragement.
8. The user may save, reflect, share, or request the next encouragement.

### First Launch Success Condition

The user reaches a relevant encouragement without creating an account or encountering an unnecessary tutorial.

## 10.2 Returning User Before Today's Check-In

1. User opens the app on a new local calendar day.
2. The app opens directly to Daily Check-In.
3. The user completes or skips the optional gratitude response.
4. The app shows a relevant encouragement.

### Requirement

The app should not repeatedly ask for the user's name after first launch.

## 10.3 Returning User After Today's Check-In

1. User opens the app again on the same local calendar day.
2. The app opens to Mood Tracker.
3. The user can review today's entry and longer-term patterns.
4. The user may still choose **Check in** to create another entry.

### Requirement

The user must not feel trapped in the check-in prompt after already completing it for the day.

## 10.4 Additional Check-In On The Same Day

1. User taps **Check in** from bottom navigation or Mood Tracker.
2. The check-in starts again from the mood question.
3. Completing it creates another timestamped entry for that date.
4. The heat map indicates multiple check-ins for that day.
5. The selected-day details show the most recent entries for that date.

## 10.5 Rediscovering Content

The user can find past content through:

- My Notes.
- Recently Seen.
- Browse Scripture.
- Journal links.
- Prayer links.

All encouragements must open in one consistent reader, regardless of entry point.

---

## 11. Feature Requirements

## 11.1 Daily Check-In

### Purpose

Collect a small amount of context to make the encouragement relevant while keeping the process emotionally light.

### Questions

1. How are you feeling today?
2. Are you in a social mood?
3. How did you sleep last night?
4. What are you grateful for today?

### Mood Options

The mood step contains twelve evenly distributed options:

- Discouraged
- Tired
- Anxious
- Lonely
- Confused
- Afraid
- Overwhelmed
- Numb
- Calm
- Hopeful
- Joyful
- Thankful

### Social Mood Options

- Isolated
- Withdrawn
- Sociable

### Sleep Options

- Poor
- Okay
- Good

### Gratitude

- Free-text response.
- Optional.
- User can save the response or skip it.
- Skipping gratitude must not cancel the rest of the check-in.
- Blank gratitude entries must not appear in the Thankfulness journal.

### Selection Rules

- The next action is unavailable until a required option is selected.
- The selected choice is visually obvious.
- The user can move backward without losing prior answers.
- The final step offers **Skip** and **Save**.
- Completion immediately leads to the encouragement.

## 11.2 Context-Matched Encouragement

The selected note should respond to:

- Mood.
- Social mood.
- Sleep.
- Pastoral tone.
- The user's recent reading history.

Pastoral behavior examples:

- Poor sleep should favor shorter, gentler notes.
- Anxiety and fear should favor peace, God's presence, providence, and prayer.
- Discouragement should favor hope, perseverance, grace, and assurance.
- Isolation should favor Christ's nearness without pressuring immediate social performance.
- Joy and thankfulness should favor worship, gratitude, grace, and service.

The recommendation must not claim to diagnose the user.

## 11.3 Reading History

- A note becomes recently seen when opened.
- Recently seen notes appear newest first.
- The app should avoid unnecessary repetition while unseen suitable notes remain.
- Users may reset reading history from the menu or Profile.
- Resetting reading history must not delete saved notes, journal entries, prayers, mood entries, or gratitude.

## 11.4 Mood Tracker

The Mood Tracker turns completed check-ins into a clear, non-judgmental history.

It includes:

- Total check-ins.
- Current consecutive-day streak.
- Total tracked days.
- Most common mood.
- Most common social state.
- Most common sleep state.
- Six-month heat map.
- Selected-day detail.
- Gentle pattern insight.
- Mood percentages.
- Social mood percentages.
- Sleep percentages.
- Thankfulness journal.

The tracker should explain patterns without making medical or spiritual judgments.

## 11.5 Saved Notes

Users can:

- Save an encouragement.
- Unsave an encouragement.
- Search saved encouragements.
- Filter saved encouragements.
- Mark a saved encouragement as a favorite.
- Add a private personal note.
- Edit or remove that personal note.
- Start a reflection.
- Start a prayer.
- Share the encouragement.

## 11.6 Journal

Users can:

- Create a reflection.
- Add a title.
- Add body text.
- Use an optional reflection prompt.
- Link an encouragement.
- Search for an encouragement to link.
- Remove a link.
- Search journal entries.
- Filter entries by linked, unlinked, or prompt-based.
- Edit an entry.
- Delete an entry with confirmation.

Prompt categories:

- Gratitude
- What I Read
- What I Need
- Obedience
- Hope

## 11.7 Prayer List

Users can:

- Create a prayer request.
- Add title and body.
- Select a category.
- Use an optional prayer prompt.
- Link an encouragement.
- Mark **Prayed Today**.
- See number of times prayed.
- Mark a request answered.
- Return an answered request to active.
- Edit a request.
- Delete a request with confirmation.
- Search requests.
- Filter by status.
- Filter by category.

Prayer categories:

- Personal
- Family
- Healing
- Provision
- Wisdom
- Church
- Salvation
- Gratitude

Prayer prompts:

- For Today
- For Someone
- While I Wait
- Answered Prayer

## 11.8 Browse Scripture

Users can:

- Search by Scripture reference.
- Search by phrase.
- Search by encouragement text.
- Browse by theme.
- Open a result in the standard encouragement reader.

Themes include:

- Peace
- Anxiety
- Strength
- Grace
- Prayer
- Hope
- Wisdom
- Faith
- God's Presence
- Love
- Joy
- Salvation

## 11.9 Recently Seen

Users can:

- Review recently opened encouragements.
- Filter by All, Today, This Week, and This Month.
- Show saved recently seen notes only.
- Save or unsave from the list.
- Open a note in the standard encouragement reader.

## 11.10 Sharing

Users can:

- Add an optional recipient name.
- Review the final message before sharing.
- Share without entering a name.
- Open the device's normal share options.
- Cancel sharing and return safely to the app.

The shared message includes:

- Personalized encouragement.
- Scripture text.
- Scripture reference.
- Daily Notes of Grace attribution.

## 11.11 Daily Reminder

The reminder is:

- Optional.
- Off by default.
- Enabled only by an explicit user action.
- Presented as a gentle daily prompt.

The user can:

- Turn it on.
- Choose a time.
- Change the time.
- Turn it off.

Requirements:

- Notification permission is requested only after the user enables the reminder.
- Denial must not block the app.
- The chosen time is shown clearly.
- The reminder copy should invite rather than pressure.
- A standard time-selection experience is preferred over restricting the user to only a few preset hours.

## 11.12 Privacy And Local Control

The user should understand:

- No account is required.
- No advertising is present.
- No analytics or tracking is present.
- Personal content stays on the device.
- Sharing is user-initiated.
- Clearing or resetting data requires confirmation.

---

## 12. Screen Specifications

## 12.1 Splash Screen

### Purpose

Provide a calm branded opening while the app prepares the user's local experience.

### UI Elements

- Full-screen quiet background.
- Centered Daily Notes of Grace wordmark.
- No buttons.
- No progress percentage.
- No promotional message.

### Behavior

- Appears briefly.
- Transitions to the name screen for a new user.
- Transitions to Check-In or Mood Tracker for a returning user.

### Acceptance Criteria

- Wordmark is sharp and fully visible.
- No content flashes behind the splash.
- Splash does not feel like a delay or advertisement.

## 12.2 Name Personalization Screen

### Purpose

Allow optional personalization without creating account friction.

### UI Elements

- Large prompt: **What's your name?**
- Name input.
- Primary continue control.
- Secondary text action: **Continue Without a Name**.

### Behavior

- Entered name is used in future encouragements.
- Empty input is allowed through the secondary action.
- Default generic greeting is **Christian** when no name exists.
- Keyboard must not cover the continue action.

### Error State

If the name cannot be saved:

- Keep the user's text visible.
- Show a short retry message.
- Do not silently discard the entry.

## 12.3 Daily Check-In Screen: Shared Frame

### Purpose

Present a four-step check-in as one focused card.

### UI Elements

- Persistent top navigation.
- Main check-in card.
- **Daily check-in** label.
- Four-segment progress indicator.
- One question at a time.
- Options or gratitude input.
- Previous and Next controls.
- Persistent bottom navigation.

### Layout Rules

- Question card remains visually stable between steps.
- Progress indicator does not change position.
- The selected step changes content without pushing navigation.
- Required content remains visible without page-level clutter.

### Motion

- Step transitions use a quick fade or restrained horizontal movement.
- No bounce.
- No large card resizing.
- Respect reduced-motion preferences.

## 12.4 Check-In Step 1: Mood

### Heading

**How are you feeling today, [Name]?**

### UI Elements

- Twelve mood option pills.
- Emoji or simple emotional symbol.
- Mood label.
- Selected state.
- Disabled Next button until selection.

### Layout

- Options are evenly distributed.
- Positive and difficult moods receive equal visual dignity.
- No option is visually presented as the "correct" answer.

### Interaction

- Tap anywhere on an option to select it.
- Selecting a new option replaces the previous selection.
- Next becomes available immediately.

## 12.5 Check-In Step 2: Social Mood

### Heading

**Are you in a social mood?**

### UI Elements

- Isolated.
- Withdrawn.
- Sociable.
- Previous.
- Next.

### Content Guidance

The language must remain neutral. Isolated and withdrawn are observations, not failures.

## 12.6 Check-In Step 3: Sleep

### Heading

**How did you sleep last night?**

### UI Elements

- Poor.
- Okay.
- Good.
- Previous.
- Next.

### Content Guidance

Avoid health claims. This answer informs tone and reading length only.

## 12.7 Check-In Step 4: Gratitude

### Heading

**What are you grateful for today?**

### UI Elements

- Multi-line text field.
- Placeholder: **Think of three things**.
- Previous.
- Skip.
- Save.

### Interaction

- Save stores the written gratitude and completes the check-in.
- Skip completes the check-in without a gratitude entry.
- Both routes open the encouragement screen.

## 12.8 Encouragement Reader

### Purpose

Deliver the main spiritual value of the product in a focused, emotionally gentle reading experience.

### Entry Points

- Completed check-in.
- Next encouragement.
- Saved Notes.
- Recently Seen.
- Browse Scripture.
- Linked encouragement from Journal.
- Linked encouragement from Prayer.

### UI Elements

- Persistent top navigation.
- Main encouragement panel.
- Encouragement text.
- **Consider what the Bible says:** introduction.
- Scripture card.
- Verse text.
- Verse reference.
- Save button.
- Reflect button.
- Share button.
- Primary **Next encouragement** button.
- Persistent bottom navigation.

### Encouragement Text Behavior

- The user's name may appear naturally in the first phrase.
- The note is divided into digestible thought chunks.
- Related lines remain together.
- Separate thoughts have a small but visible gap.
- No text is clipped.
- No ellipsis is used in the full reader.
- Font size adapts within a controlled readable range.
- If content still does not fit, the content must be revised rather than hidden.

### Soft Reveal Behavior

- Text appears from its final position.
- The layout reserves final space before animation begins.
- Encouragement reveals gently.
- The Scripture introduction follows.
- Scripture reveals after the encouragement.
- Actions appear left to right after the reading content.
- The user can tap to advance or complete the reveal.
- The reveal never causes content to jump.
- A reduced-motion setting shows content immediately or uses a simple fade.

### Save

- Tapping Save changes the control to a clear saved state.
- Tapping again removes the saved state.
- The user remains on the reader.

### Reflect

- Opens a new reflection.
- Pre-fills a relevant prompt.
- Links the current encouragement.

### Share

- Opens Share Preview.
- Returning from Share returns to the same encouragement.

### Next Encouragement

- Shows another suitable note using the same check-in context.
- Avoids the current note.
- Keeps the reader layout stable.

### Acceptance Criteria

- Full encouragement is visible.
- Full Scripture is visible.
- Actions remain reachable.
- Navigation does not overlap the panel.
- Long names do not break containment.
- Opening the same note from different sections produces the same reader.

## 12.9 Mood Tracker

### Purpose

Help users notice patterns without judgment and reconnect those patterns to a gentle Scripture habit.

### UI Hierarchy

1. Hero summary.
2. Summary metrics.
3. Six-month heat map.
4. Selected-day detail.
5. Gentle insight.
6. Mood distribution.
7. Social distribution.
8. Sleep distribution.
9. Thankfulness journal.

### Hero Summary

Contains:

- **Mood Tracker** title.
- Short explanation.
- Total check-ins.
- Current streak.
- Tracked days.

The streak is informational, not competitive.

### Summary Metrics

Three compact cards:

- Most common mood.
- Social energy.
- Sleep pattern.

If there is no data, use plain empty labels such as **No mood yet** rather than zero-heavy statistics.

### Heat Map

Requirements:

- Default view covers approximately six months.
- Seven days are arranged vertically.
- Weeks progress horizontally.
- User can scroll horizontally through the full period.
- Filled days are visually distinct from empty days.
- Multiple check-ins on one day use a stronger state.
- Selected day has a clear outline or highlight.
- Heat map uses the available card width efficiently.

### Selected-Day Detail

When a day is selected, show:

- Readable date.
- Number of check-ins.
- Mood.
- Social mood.
- Sleep quality.
- Gratitude, when present.
- Up to the most relevant recent entries when multiple entries exist.

For a day with no entry:

- State clearly that no check-in was recorded.
- Do not display blank fields.

### Insight Card

The insight:

- Uses plain pastoral language.
- Describes an observable pattern.
- Avoids diagnosis.
- Avoids claiming direct spiritual causes.
- Offers a gentle next step.

### Distribution Cards

For Mood, Social, and Sleep:

- Show all available states.
- Show percentage and relative bar.
- Identify the most common state.
- Use understandable labels.
- Avoid unnecessary decimal precision.

### Thankfulness Journal

- Shows gratitude entries newest first.
- Each entry displays the date and full gratitude text.
- Blank gratitude responses are excluded.
- If no gratitude exists, show a gentle empty state.

### Empty State

When no check-ins exist:

- Explain what will appear after the first check-in.
- Provide a clear **Check in** action.
- Do not show meaningless charts full of zeroes.

## 12.10 My Notes

### Purpose

Provide one understandable home for saved encouragements and access to private reflections.

### UI Elements

- **My Notes** title.
- Journal shortcut.
- Search field.
- Filter chips.
- Result count.
- Saved-note cards.
- Empty state.

### Filters

- All.
- Favorites.
- Relevant theme filters.

### Saved-Note Card

Contains:

- Verse reference.
- Favorite marker when applicable.
- Short encouragement preview.
- Up to three themes.
- Personal-note preview when one exists.

### Empty State

When no saved encouragements exist:

- Title: **No saved encouragements yet.**
- Explain that saved notes will appear here.
- Offer **Open Journal** as a useful secondary action.

### No Search Results

- State that no saved notes match.
- Suggest changing the search or filter.
- Preserve the user's current query.

## 12.11 Saved Note Detail

### UI Elements

- Compact back control labeled **My Notes**.
- **Saved Note** title.
- Theme tags.
- Full encouragement.
- Scripture and reference.
- Personal note section.
- Save personal note control.
- Favorite.
- Reflect.
- Pray.
- Share.
- Remove from Saved.

### Interaction

- Personal note remains editable.
- Saving provides visible confirmation.
- Removing the saved note requires confirmation.
- Removing returns to My Notes.
- Reflect and Pray create linked entries.

## 12.12 Journal List

### UI Elements

- Eyebrow: **Private reflections**.
- Title: **Journal**.
- New button.
- Search field.
- Filters: All, Linked, Unlinked, Prompts.
- Entry count.
- Reflection cards.

### Reflection Card

Contains:

- Updated date.
- Linked verse or prompt marker.
- Title.
- Short body preview.

### Empty State

- **No reflections yet.**
- Explain that the user can create a private entry and connect it to a verse or encouragement.
- Make the New action obvious.

## 12.13 Journal Editor

### UI Elements

- Back control.
- **Journal** title.
- Reflection prompt chips.
- Title field.
- Multi-line reflection field.
- Linked encouragement section.
- Search field for encouragements.
- Link results.
- Remove Link action.
- Save Reflection.
- Delete, when editing.

### Behavior

- Selecting a prompt may populate empty fields.
- Selecting another prompt must not unexpectedly erase existing writing.
- A completely blank reflection cannot be saved.
- Delete requires confirmation.
- After save, return to the Journal list.

## 12.14 Prayer List

### UI Elements

- Eyebrow: **Requests and answers**.
- Title: **Prayer List**.
- New button.
- Search field.
- Status filters: Active, Answered, All.
- Category filters.
- Result count.
- Prayer request cards.

### Prayer Request Card

Contains:

- Added or answered date.
- Status or category.
- Title.
- Short body preview.
- Times prayed.
- Last-prayed date when available.

### Empty State

- **No prayer requests here yet.**
- Explain that the user can add a request, mark when they prayed, and keep answers visible.

## 12.15 Prayer Editor

### UI Elements

- Back control.
- **Prayer** title.
- Prayer prompt chips.
- Category chips.
- Title field.
- Multi-line request field.
- Linked encouragement, when present.
- Remove Link action.
- Save Prayer.
- Delete, when editing.

### Behavior

- Blank prayers cannot be saved.
- Choosing the Answered Prayer prompt should suggest Gratitude as the category.
- Existing writing must not be overwritten without user action.
- Delete requires confirmation.

## 12.16 Prayer Detail

### UI Elements

- Back control.
- **Prayer** title.
- Date.
- Category or Answered status.
- Prayer title.
- Prayer body.
- Linked encouragement, when present.
- Times prayed.
- Category.
- Last prayed date.
- Answered date, when applicable.
- Prayed Today.
- Mark Answered or Mark Active.
- Edit Prayer.

### Behavior

- Prayed Today increases the visible count.
- Mark Answered changes the status and records the date.
- Mark Active restores an answered request to active.
- Edit opens the existing request without data loss.

## 12.17 Browse Scripture

### UI Elements

- Title: **Browse**.
- Search field.
- Theme filters.
- Result cards.
- Empty state.

### Search Behavior

Search covers:

- Verse reference.
- Scripture text.
- Encouragement text.
- Themes.

### Result Card

Contains:

- Verse reference.
- Short encouragement preview.
- Themes.

### Result Opening

- Opens the standard encouragement reader.
- Must not open a visually different legacy detail screen.

## 12.18 Recently Seen

### UI Elements

- Title: **Recently Seen**.
- Short explanatory subtitle.
- History icon.
- Filters: All, Today, This Week, This Month.
- Saved-only filter control.
- Recently seen cards.

### Recently Seen Card

Contains:

- Verse reference.
- Relative time.
- Short encouragement preview.
- Themes.
- Save or saved control.

### Empty State

When no history exists:

- **No recent encouragements yet.**
- Explain that reading history begins with an encouragement.
- Offer **Begin today's encouragement**.

When a filter has no matches:

- Say that no notes match the filter.
- Suggest All or disabling saved-only filtering.

## 12.19 Share Preview

### Purpose

Let the user review and optionally personalize the message before leaving the app.

### UI Elements

- Back control.
- Eyebrow: **Send encouragement**.
- Title: **Prepare a note**.
- Short instruction.
- Recipient name field.
- Message preview card.
- Verse reference.
- Scrollable message preview when necessary.
- Primary **Share encouragement** button.

### Behavior

- Recipient name is optional.
- Leaving it blank uses a respectful generic greeting.
- Share opens the device's normal share options.
- Canceling returns the user to the preview or prior screen without losing app state.

## 12.20 Profile

### UI Hierarchy

1. Title and subtitle.
2. Name card.
3. About summary.
4. Privacy summary.
5. Care summary.
6. Daily reminder.
7. Manage notes.

### Name Card

Contains:

- User icon.
- **Your name** label.
- Editable name field.
- Save button.

Changing the name affects future personalized encouragements.

### About Summary

Explains:

- Christ-centered purpose.
- KJV Scripture pairing.
- Focus on pointing the heart back to Jesus.

### Privacy Summary

States:

- Data stays on the device.
- No tracking.

### Care Summary

States:

- Spiritual encouragement is not a replacement for professional or emergency care.

### Daily Reminder

Contains:

- Reminder icon.
- Title.
- Current status.
- On/off switch.
- Time selection.

### Manage Notes

Contains:

- Reset Seen Notes.
- Clear Saved Notes.

Both actions require confirmation and explain exactly what will and will not be deleted.

## 12.21 About

### UI Elements

- Title: **About**.
- Subtitle.
- Branded feature card.
- **What this app is** explanation.
- **Scripture first** value card.
- **Private by design** value card.
- Featured Scripture.
- Care reminder.

### Content Goal

Explain the product clearly without becoming a marketing landing page.

## 12.22 Privacy

### UI Elements

- Title: **Privacy**.
- Single readable information card or short grouped sections.

### Required Content

- Name stays on the device.
- Check-ins stay on the device.
- Saved notes stay on the device.
- Reflections stay on the device.
- Prayer requests stay on the device.
- Reading history stays on the device.
- No account.
- No ads.
- No analytics.
- No tracking.

## 12.23 Care Note

### UI Elements

- Title: **Care Note**.
- Calm information card.

### Required Content

These notes are for spiritual encouragement and are not a replacement for:

- Pastoral care.
- Medical care.
- Mental health care.
- Emergency care.

The language must be direct, not hidden in legal wording.

## 12.24 Menu Drawer

### Purpose

Provide secondary navigation without overcrowding the bottom navigation.

### UI Elements

- Dimmed background.
- Right-side panel.
- Close button.
- Personalized greeting.
- Short product message.
- Grouped navigation sections.
- Care Note card.
- Reset reading history action.

### Sections

**Library**

- My Notes
- Recently Seen

**Practice**

- Mood Tracker
- Journal
- Prayer

**Explore**

- Browse Scripture

**App**

- Profile
- About
- Privacy

### Behavior

- Opens immediately.
- Closes from the close button or outside panel.
- Selecting a row closes the menu and opens the destination.
- Rows have consistent icons, labels, chevrons, and tap targets.
- The panel is scrollable on small devices.
- Reset reading history is visually separated from normal navigation.

---

## 13. Global UI Element Requirements

## 13.1 Buttons

### Primary Button

Use for:

- Save check-in.
- Next encouragement.
- Save Reflection.
- Save Prayer.
- Share encouragement.

Characteristics:

- Strong but not oversized.
- High-contrast label.
- Clear press feedback.
- One main primary action per section.

### Secondary Button

Use for:

- Save.
- Reflect.
- Share.
- Favorite.
- Prayed Today.
- Mark Answered.

Characteristics:

- White or softly tinted surface.
- Purple accent icon and label.
- Visible border.
- Less emphasis than the primary action.

### Destructive Action

Use for:

- Delete reflection.
- Delete prayer.
- Remove from saved.
- Clear saved notes.

Characteristics:

- Destructive meaning is explicit.
- Confirmation is mandatory.
- The control must not visually resemble a routine navigation action.

## 13.2 Cards

Cards should:

- Group one meaningful concept.
- Use consistent internal padding.
- Avoid large empty fixed-height areas.
- Expand naturally for lists and details.
- Use a fixed, tested frame only where the full-screen reader requires it.
- Never contain another decorative card without a clear functional reason.

## 13.3 Chips And Filters

Chips must:

- Use short labels.
- Have obvious selected and unselected states.
- Remain readable at larger text sizes.
- Scroll horizontally when the group cannot fit.
- Never clip the final label.

## 13.4 Search Fields

Search fields must:

- Include a search icon.
- Use a descriptive placeholder.
- Support clearing.
- Keep the query visible when no results exist.
- Search as the user types without jarring layout changes.

## 13.5 Text Fields

Text fields must:

- Have visible labels or meaningful placeholders.
- Use sufficient contrast.
- Expand appropriately for multi-line content.
- Remain visible above the keyboard.
- Preserve text if saving fails.

## 13.6 Empty States

Every empty state must include:

1. A plain-language title.
2. One sentence explaining why the screen is empty.
3. One useful next action when appropriate.

Empty states should not:

- Blame the user.
- Display large decorative blank space.
- Use technical error wording.

## 13.7 Confirmation Dialogs

Confirmation is required for:

- Delete reflection.
- Delete prayer.
- Remove saved note.
- Clear all saved notes.
- Reset reading history.

Each confirmation must explain:

- What will be removed.
- Whether the action affects other data.
- How to cancel.

## 13.8 Feedback

The user should receive immediate visual feedback for:

- Selecting a check-in option.
- Saving or unsaving a note.
- Favoriting.
- Saving profile changes.
- Saving a personal note.
- Marking a prayer as prayed.
- Marking a prayer answered.
- Changing reminder settings.

Feedback should not rely only on color.

---

## 14. Content And Copy Standards

### 14.1 Voice

The voice is:

- Gentle.
- Direct.
- Theologically clear.
- Personal without becoming presumptuous.
- Calm without becoming passive.
- Hopeful without denying hardship.

### 14.2 UI Copy

UI copy should:

- Use simple verbs.
- Avoid technical language.
- Keep button labels short.
- Explain consequences before destructive actions.
- Use sentence case.

### 14.3 Encouragement Length

Preferred:

- Encouragement body: approximately 260 to 340 characters.
- Scripture body: approximately 80 to 170 characters.

Upper limits should be treated as content-review warnings, not invitations to shrink the text excessively.

### 14.4 Preview Text

List previews may use ellipses.

Full reader, saved detail, and share preview must show the complete intended content.

---

## 15. Motion And Transition Requirements

### 15.1 General Motion

- Use short, calm transitions.
- Avoid bouncing.
- Avoid large scale changes.
- Avoid content shifting after it appears.
- Keep navigation transitions consistent.

### 15.2 Encouragement Reveal

- Reserve final layout space before reveal begins.
- Reveal from the final position.
- Use soft opacity changes.
- Use character or word progression only when it remains readable.
- Give users a way to advance the reveal.
- Do not delay essential actions excessively.

### 15.3 Press Feedback

Buttons and cards may:

- Scale down very slightly.
- Strengthen border or tint.
- Soften shadow.

Feedback must be quick and subtle.

### 15.4 Reduced Motion

When the user prefers reduced motion:

- Replace typing effects with immediate text or a simple fade.
- Remove unnecessary movement.
- Preserve all content and controls.

---

## 16. Accessibility Requirements

### 16.1 Readability

- Text contrast must remain strong.
- Devotional text must not use excessively light colors.
- Scripture italics must remain readable.
- Text must not be placed over a visually busy image without a sufficient surface or overlay.

### 16.2 Text Scaling

- Important content must remain visible at larger text sizes.
- Navigation labels must not disappear.
- Controls may grow vertically where necessary.
- Full encouragement and Scripture must not be clipped.

### 16.3 Screen Reader

Every interactive element needs a meaningful spoken label.

Examples:

- "I feel anxious."
- "Save encouragement."
- "Remove saved encouragement."
- "Set daily reminder for 7 AM."
- "March 15, one check-in."

Decorative icons should not be announced separately.

### 16.4 Touch Targets

- Entire cards and rows should be tappable where the whole component is an action.
- Icon-only controls need generous touch areas.
- Adjacent controls must not be so close that they cause accidental taps.

### 16.5 Color

- Selected states must not rely on color alone.
- Use changes in border, icon, label weight, background, or marker.

### 16.6 Orientation

The intended mobile experience is portrait.

---

## 17. Privacy And Emotional Safety

### 17.1 Privacy Promises

The product experience must consistently support these promises:

- No account required.
- No ads.
- No analytics.
- No tracking.
- No public profile.
- No social feed.
- User-created content stays private on the device.

### 17.2 Permissions

The app should not request:

- Location.
- Contacts.
- Photos.
- Camera.
- Microphone.
- Health data.

Notification permission is requested only when the user enables the daily reminder.

### 17.3 Emotional Safety

- Mood answers are not diagnoses.
- Insights should be framed as observations.
- The app should not respond to difficult moods with simplistic positivity.
- The Care Note remains available from the menu and Profile.
- The app must not imply that prayer replaces urgent or professional care.

---

## 18. Error And Recovery States

## 18.1 Saving Failure

If a local change cannot be saved:

- Show a clear message.
- Keep the user's input.
- Allow retry.
- Do not navigate away as if saving succeeded.

## 18.2 Reminder Permission Denied

- Explain that reminders remain off.
- Keep all other features available.
- Do not repeatedly request permission.

## 18.3 Share Failure

- Explain that sharing did not open.
- Keep the prepared message intact.
- Allow retry.

## 18.4 Missing Or Invalid Content

If an encouragement cannot load:

- Show a calm fallback.
- Offer another encouragement.
- Do not display a blank reader.

## 18.5 No Search Results

- Preserve the query.
- State that no matches were found.
- Suggest changing filters or wording.

---

## 19. Daily State Rules

### Before A Check-In

- Default destination is Check in.
- Bottom navigation highlights Check in.

### After A Check-In

- User sees an encouragement immediately.
- The completed entry appears in Mood Tracker.

### Reopening The App The Same Day

- Default destination is Mood Tracker.
- Bottom navigation highlights Mood Tracker.

### Opening The App On A New Day

- Default destination returns to Check in.

### Manual Check-In

- Check in remains available at all times.
- Additional same-day entries are allowed.

---

## 20. Navigation Rules

- Bottom navigation changes primary sections.
- Menu opens secondary sections.
- Back controls return to the immediate parent context.
- Opening an encouragement remembers where the user came from.
- Closing Share returns to the previous encouragement.
- Saving, reflecting, praying, and sharing must not unexpectedly send the user to Check in.
- Browse and Recently Seen must use the same reader as the daily flow.
- The top and bottom navigation positions must remain visually identical across screens.

---

## 21. First-Version Scope

### Included

- Optional name personalization.
- Daily check-in.
- Mood-based encouragement.
- Mood Tracker.
- Saved notes.
- Personal notes on saved encouragements.
- Recently Seen.
- Journal.
- Prayer List.
- Browse Scripture and themes.
- Share preview.
- Optional daily reminder.
- Profile.
- About.
- Privacy.
- Care Note.

### Not Included

- User accounts.
- Cloud synchronization.
- Cross-device data transfer.
- Public profiles.
- Social posting.
- Comments.
- Messaging.
- Paid subscriptions.
- Advertising.
- Analytics.
- Clinical mood interpretation.
- Pastoral chat.
- Multiple Bible translations.
- User-created public content.

---

## 22. Product Acceptance Criteria

The product is ready for user testing only when:

### Navigation

- Top navigation remains fixed and aligned across all main screens.
- Bottom navigation remains fixed and aligned across all main screens.
- All menu destinations open correctly.
- No screen creates a duplicate or conflicting navigation bar.

### Check-In

- All four steps are understandable.
- Required steps prevent accidental continuation without a choice.
- Previous preserves selections.
- Skip and Save both open an encouragement.
- Returning users see the correct default screen for the day.

### Encouragement

- Full note is visible.
- Full Scripture is visible.
- No reader content uses ellipses.
- Save, Reflect, Share, and Next work.
- Reveal motion does not cause layout shifts.
- Long names remain contained.

### Mood Tracker

- Heat map uses space efficiently.
- Days are selectable.
- Selected-day information is accurate.
- Multiple same-day check-ins are represented.
- Distribution percentages are understandable.
- Gratitude entries appear newest first.
- Blank gratitude entries are omitted.

### My Notes

- Save and unsave work.
- Search and filters work.
- Favorite works.
- Personal note persists.
- Reflect, Pray, and Share work.

### Journal

- Create, edit, search, filter, link, unlink, and delete work.
- Blank entries cannot be saved.

### Prayer

- Create, edit, search, filter, categorize, mark prayed, mark answered, reactivate, and delete work.
- Blank requests cannot be saved.

### Browse And History

- Search returns relevant results.
- Filters work.
- Recently Seen orders notes newest first.
- Results open the standard reader.

### Profile And Privacy

- Name changes affect future notes.
- Reminder is fully user-controlled.
- Privacy and Care messages are clear.
- Destructive actions require confirmation.

### Accessibility

- All buttons have meaningful labels.
- Larger text does not clip critical content.
- Touch targets are usable.
- Selected states are not color-only.
- Reduced motion preserves the full experience.

### Quality

- No crashes.
- No blank screens.
- No overlapping controls.
- No excessive blank fixed-height areas.
- No hidden content behind navigation.
- No account, ad, analytics, or tracking prompts.

---

## 23. Recommended UX Validation Scenarios

Test the experience with:

1. A new user who enters a short name.
2. A new user who enters a long name.
3. A user who continues without a name.
4. A user selecting each of the twelve moods.
5. A user with poor sleep and an anxious mood.
6. A user who skips gratitude.
7. A user who completes two check-ins on one day.
8. A user with no Mood Tracker history.
9. A user with six months of history.
10. A user with no saved notes.
11. A user with many saved notes and personal annotations.
12. A user with no journal or prayer entries.
13. A user with many journal and prayer entries.
14. A user using large text.
15. A user using a screen reader.
16. A user using reduced motion.
17. A user who denies notification permission.
18. A user who cancels the share sheet.
19. A user who searches for a verse reference.
20. A user who opens the same note from Check-In, Saved, Browse, and Recently Seen.

---

## 24. Final Experience Definition

Daily Notes of Grace should feel like a private morning rhythm:

1. The user honestly names the day.
2. The app listens without judging.
3. The app offers a relevant, Christ-centered encouragement.
4. Scripture receives the final emphasis.
5. The user may save, reflect, pray, or share.
6. Over time, the app helps the user notice patterns and remember God's kindness.

The product succeeds when the user can complete this rhythm without confusion, pressure, visual distraction, privacy anxiety, or theological vagueness.
