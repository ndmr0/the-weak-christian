# Daily Notes of Grace Notes Database and Mood Mapping Audit

Date: 2026-06-09

Scope:
- Source data: `src/data/encouragements.json`
- Current mapping code: `App.js`
- Repeatable audit command: `npm run audit:mapping`
- Repeatable metadata command: `npm run map:data`
- Theological lens: Christian, Reformed/Calvinistic, Christ-centered, gospel-oriented, pastoral rather than generic self-help

## Executive Verdict

The notes database is usable, broadly healthy, and now mapped directly to the new daily check-in experience.

The strongest point is that all 1,000 encouragement records contain explicit Christ/Jesus/Saviour/salvation language in the encouragement text. The app is not merely generic spirituality.

The original issue was that the app mapped notes using broad `themes` and keyword search from only the selected mood. That has now been changed. Each note now has explicit pastoral metadata, and the recommendation logic scores notes against mood, social mood, sleep, tone, intensity, and doctrinal emphasis.

The next content task is not technical mapping. It is writing and reviewing more notes deliberately for the thinner pastoral categories.

## Current Dataset Summary

Audit result:
- Total records: 1,000
- Display-eligible records under current screen limits: 900
- Records excluded by current length rules: 100
- Long encouragement messages: 18
- Long scripture passages: 82
- Duplicate verse references: 0, already validated by `scripts/validate-data.mjs`
- Translation: KJV across the dataset

Current length profile:
- Encouragement message p50: 303 characters
- Encouragement message p95: 345 characters
- Encouragement message max: 388 characters
- Scripture p50: 123 characters
- Scripture p95: 203 characters
- Scripture max: 268 characters

Screen fit conclusion:
- The encouragement text is mostly safe.
- The scripture text is the larger containment risk.
- The app should keep the main note screen around:
  - Encouragement body: 260 to 340 characters
  - Scripture body: 80 to 170 characters
  - Absolute max scripture body for the main screen: 190 characters

## Current Theme Distribution

All records:
- Faith: 645
- Grace: 420
- Strength: 345
- God's Presence: 310
- Hope: 269
- Guidance: 256
- Identity in Christ: 241
- Peace: 231
- Salvation: 195
- Joy: 191
- Prayer: 161
- Wisdom: 153
- Love: 130
- Perseverance: 126
- Provision: 122
- Renewal: 114
- Encouragement: 43
- Comfort: 21
- Contentment: 1

Interpretation:
- The dataset is heavily weighted toward Faith, Grace, Strength, Presence, Hope, and Guidance.
- `Comfort` is underrepresented despite being used in mood mappings.
- `Contentment` is almost absent despite being used for Calm, Joyful, and Thankful.
- `Encouragement` is too generic and should be replaced with more specific theological/pastoral categories.

## Current Direct Mood Coverage

Using explicit `moods` metadata and only the 900 display-eligible notes:

- Discouraged: 134 matches
- Tired: 230 matches
- Anxious: 342 matches
- Lonely: 222 matches
- Confused: 250 matches
- Afraid: 243 matches
- Overwhelmed: 217 matches
- Numb: 118 matches
- Calm: 192 matches
- Hopeful: 219 matches
- Joyful: 166 matches
- Thankful: 159 matches

This is materially better than the old broad theme matching.

The stronger moods are still broad enough to avoid repetition, but now the app can prioritize direct matches rather than treating most notes as equally relevant.

Remaining refinement:
- Anxious, Confused, Afraid, Tired, Lonely, Overwhelmed, and Hopeful have larger direct pools than the ideal target.
- That is acceptable for now because the weighted scorer narrows by social mood, sleep, tone, and intensity.
- When adding new manually written notes, keep each mood's primary pool intentional rather than simply increasing all counts.

## Check-In Mapping Gap

Current check-in questions:
- Mood
- Social mood
- Sleep
- Gratitude

Current recommendation logic:
- Uses selected mood.
- Uses selected social mood.
- Uses selected sleep state.
- Uses tone and intensity metadata to avoid giving heavy notes to low-energy users.
- Keeps gratitude as tracker/journal content rather than forcing it into the recommendation.

This closes the original product gap. The user now answers meaningful questions and those answers affect the encouragement selection.

## Theological Audit

### Strengths

The dataset is explicitly Christian and Christ-centered:
- 1,000 of 1,000 records contain Christ/Jesus/Saviour/salvation language in the encouragement text.
- The notes regularly point the user to Christ as refuge, Saviour, Redeemer, Shepherd, source of strength, and ground of hope.
- The tone is usually pastoral rather than motivational.
- The notes generally avoid prosperity language, vague manifestation language, and therapeutic self-help framing.

### Reformed/Calvinistic Strengths

The dataset frequently emphasizes:
- God's faithfulness
- Christ's sufficiency
- grace as the ground of confidence
- mercy for weakness
- perseverance under God's care
- the believer being kept and upheld by God
- gospel comfort before moral exhortation

These are consistent with the desired Reformed, gospel-oriented direction.

### Areas to Strengthen

Not every note needs to use the same theological words, but the system should increase explicit gospel grounding where appropriate.

Audit signals:
- 596 records do not include explicit grace/mercy/forgiveness/repentance/cross/finished-work vocabulary in the encouragement text.
- 504 records do not include explicit kept/upheld/faithful/promise/covenant/shepherd/refuge/finished-work vocabulary.

This does not mean those notes are bad. Many are still Christ-centered. It means the next data expansion should intentionally add more notes with clearer gospel grounds, especially for guilt, fear, shame, numbness, and discouragement.

### Content to Avoid

Avoid:
- "Believe in yourself" style counsel.
- "You are enough by yourself" language.
- Any implication that the user earns God's acceptance by performance.
- Generic positivity without Christ.
- Prosperity guarantees.
- Commands without gospel grounding.
- Heavy imperative language for exhausted or anxious users.

Preferred pattern:
1. Name the condition gently.
2. Ground comfort in Christ, grace, Scripture, and God's covenant faithfulness.
3. Give one simple response: rest, pray, trust, repent, ask, endure, worship, or take the next faithful step.

## Implemented Data Schema

Each encouragement should eventually include explicit mapping fields:

```json
{
  "id": 1,
  "encouragement_template": "...",
  "verse_text": "...",
  "verse_reference": "...",
  "themes": ["Grace", "Faith"],
  "moods": ["Discouraged", "Tired"],
  "socialMoods": ["Withdrawn", "Isolated"],
  "sleepStates": ["Poor", "Okay"],
  "pastoralIntent": "assurance",
  "doctrinalEmphasis": ["Christ's sufficiency", "perseverance", "grace"],
  "tone": "gentle",
  "intensity": "low",
  "lengthTier": "screen-safe"
}
```

Implemented fields:
- `moods`: direct emotional states this note is designed for.
- `socialMoods`: optional social context fit.
- `sleepStates`: optional rest/energy context fit.
- `pastoralIntent`: one main purpose, such as assurance, comfort, repentance, rest, wisdom, courage, gratitude, renewal.
- `doctrinalEmphasis`: theological anchors, such as Christ's sufficiency, grace, providence, perseverance, union with Christ, forgiveness, resurrection hope.
- `tone`: gentle, steady, corrective, joyful, reflective.
- `intensity`: high-need, low-energy, steady.
- `lengthTier`: short, screen-safe, long.

## Recommended Mood Mapping

Discouraged:
- Primary: Hope, Perseverance, Grace, Assurance
- Gospel focus: Christ has not failed; hope rests on promise, not mood.

Tired:
- Primary: Rest, Strength, Mercy, Providence
- Gospel focus: Christ carries the weary; weakness is not rejection.

Anxious:
- Primary: Peace, Faith, God's Presence, Prayer
- Gospel focus: God's fatherly care, Christ's nearness, providence without panic.

Lonely:
- Primary: God's Presence, Love, Union with Christ, Church
- Gospel focus: the believer is known, loved, and not forsaken.

Confused:
- Primary: Wisdom, Guidance, Scripture, Humility
- Gospel focus: Christ is wisdom; God's word gives light without demanding omniscience.

Afraid:
- Primary: Refuge, Providence, Strength, Faith
- Gospel focus: Christ is Lord over what threatens the soul.

Overwhelmed:
- Primary: Burden-bearing, Mercy, Strength, Prayer
- Gospel focus: Christ receives needy people and gives help in weakness.

Numb:
- Primary: Renewal, Grace, Presence, Prayer
- Gospel focus: spiritual dryness is not beyond God's restoring care.

Calm:
- Primary: Abiding, Gratitude, Peace, Worship
- Gospel focus: quiet days can become fellowship with Christ, not spiritual autopilot.

Hopeful:
- Primary: Promise, Perseverance, Future hope, Resurrection
- Gospel focus: hope is anchored in Christ, not optimism.

Joyful:
- Primary: Joy, Worship, Thanksgiving, Love
- Gospel focus: joy returns to Christ as its source.

Thankful:
- Primary: Gratitude, Praise, Grace, Providence
- Gospel focus: thanksgiving recognizes gift, mercy, and God's faithful provision.

## Recommended Social Mood Mapping

Isolated:
- Use gentle presence notes.
- Avoid pressuring immediate social performance.
- Include Christ's nearness and, sometimes, a simple invitation toward fellowship.

Withdrawn:
- Use notes about being known, carried, and gently drawn back.
- Good pairings: Lonely, Numb, Tired, Discouraged.

Sociable:
- Use notes about love, service, gratitude, and encouraging others.
- Good pairings: Joyful, Thankful, Hopeful, Calm.

## Recommended Sleep Mapping

Poor:
- Use shorter, lower-intensity notes.
- Emphasize mercy, rest, God's patience, and small faithful steps.
- Avoid long theological density and heavy exhortation.

Okay:
- Use steady devotional notes.
- Balanced encouragement and practical response.

Good:
- Use gratitude, worship, readiness, service, and joyful obedience.
- The note can be slightly more active in tone.

## Implemented Selection Algorithm

Broad filtering has been replaced with weighted scoring:

```txt
score =
  direct mood match: strong positive weight
  social mood match: positive weight
  sleep state match: positive weight
  poor sleep + gentle/low-energy note: additional positive weight
  high-need mood + comfort/assurance/rest/renewal: additional positive weight
  joyful/thankful mood + joyful/gratitude/prayer note: additional positive weight
  Christ's sufficiency and grace: small positive weight
  broad themes and keywords: fallback only
```

Then:
1. Score all screen-safe notes.
2. Exclude recently seen notes if possible.
3. Pick from the top 10 to 25 matches with light randomness.
4. Fall back to mood-only if no strong social/sleep match exists.
5. Fall back to general Christ-centered notes only as the final layer.

This gives the app both stability and freshness.

## Recommended Data Expansion Plan

Do not just add random notes.

Build a balanced matrix:
- 12 moods
- 3 social states
- 3 sleep states
- 4 to 6 pastoral intents

Minimum target:
- 80 to 120 direct notes per mood.
- At least 30 direct notes per sleep state.
- At least 30 direct notes per social state.
- At least 15 notes per high-need combination, such as:
  - Anxious + Poor sleep
  - Lonely + Isolated
  - Numb + Withdrawn
  - Discouraged + Poor sleep
  - Overwhelmed + Poor sleep
  - Confused + Withdrawn

Recommended first expansion:
- Keep the current 1,000 records.
- Add explicit mapping metadata to all existing records.
- Then add 500 to 1,000 new records focused on weak areas:
  - Comfort
  - Contentment
  - Numbness
  - Poor sleep
  - Social isolation
  - Repentance without despair
  - Assurance without presumption
  - Joy and gratitude rooted in Christ

## Implementation Completed

1. Kept `scripts/audit-note-mapping.mjs`.
2. Added `scripts/apply-note-metadata.mjs`.
3. Added `npm run map:data`.
4. Added explicit mapping fields to `src/data/encouragements.json` and `encouragements_kjv_1000.jsonl`.
5. Updated validation so every note must include:
   - `moods`
   - `socialMoods`
   - `sleepStates`
   - `pastoralIntent`
   - `doctrinalEmphasis`
   - `tone`
   - `intensity`
   - `lengthTier`
6. Updated check-in completion so the recommendation receives:
   - selected mood
   - selected social mood
   - selected sleep
7. Added `getCheckInFeedItems(name, checkIn)` and weighted scoring in `App.js`.
8. Kept broad `themes` as secondary metadata, not the main personalization system.

## Final Assessment

The current note database has a strong Christ-centered base and is not theologically generic. It is suitable as a working foundation.

The main technical weakness has been addressed: the metadata and matching architecture now fit the daily check-in flow.

The next weakness is editorial depth. Some categories need more intentionally written notes, especially:
- poor sleep
- social isolation
- numbness
- repentance without despair
- assurance without presumption
- joy and gratitude rooted in Christ
- contentment
- comfort

Best next step:
Begin the next note expansion using this metadata schema from the beginning.
