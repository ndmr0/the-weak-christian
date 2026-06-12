# Daily Notes of Grace

## Master Prompt For Producing 2,000 New Encouragement Records

Copy this entire document into the new agent's chat. Provide the files listed in **Required Source Files** with the prompt.

---

# START OF PROMPT FOR THE DATABASE AGENT

You are responsible for producing a production-ready expansion of the encouragement database for a Christian mobile application named **Daily Notes of Grace**.

This is not a brainstorming task, sample-writing exercise, or request for a few generic devotionals. You must create, validate, audit, and package **exactly 2,000 new encouragement records** that can be merged with the application's existing 1,000 records.

Your final deliverable must be downloadable files, not 2,000 records pasted into the chat.

Do not stop after providing a plan, schema, examples, or generation script. Complete the entire dataset and all validation deliverables.

---

## 1. Product Context

Daily Notes of Grace is a private, Christ-centered devotional application.

The primary daily experience is:

1. The user answers how they are feeling.
2. The user answers whether they feel isolated, withdrawn, or sociable.
3. The user reports whether sleep was poor, okay, or good.
4. The user may write an optional gratitude entry.
5. The app selects a contextually relevant encouragement.
6. The encouragement points the user to God, the gospel, and trust in Jesus Christ.
7. The encouragement is paired with an exact King James Version Bible verse.

The application also includes:

- Mood history.
- Saved encouragements.
- Private reflections.
- Prayer requests.
- Recently viewed notes.
- Scripture and theme search.
- Sharing.

The new database must strengthen the quality, relevance, variety, and longevity of the daily encouragement experience.

---

## 2. Required Source Files

Before generating anything, read all of these files:

1. `src/data/encouragements.json`
   - The current 1,000 production records.
   - Use it to preserve the exact schema.
   - Use it to exclude existing verse references.
   - Use it to detect duplicate and near-duplicate encouragement language.

2. `verses-1769.json`
   - The only approved source for KJV verse wording.
   - Never invent, reconstruct from memory, modernize, or paraphrase Scripture.

3. `notes-mood-mapping-audit.md`
   - The current theological, pastoral, mood-mapping, and coverage assessment.

4. `UX-PRD.md`
   - The product experience, user flow, content behavior, and screen requirements.

5. `scripts/validate-data.mjs`
   - The current required fields and supported enum values.

6. `App.js`
   - Read only the mood definitions and the note-selection logic.
   - Do not redesign or modify the application.

If any required file is unavailable, request it before generating the database. Do not guess the current schema or existing verse list.

---

## 3. Scope

Create:

- Exactly **2,000 new records**.
- A merged database containing the existing 1,000 records plus the 2,000 new records.
- Exactly **3,000 total records** in the merged output.

Do not alter the wording, metadata, IDs, or verse references of the existing 1,000 records.

Determine the highest existing ID from the supplied database.

- New IDs must begin at `highest existing ID + 1`.
- New IDs must be sequential.
- With the current supplied database, the expected new ID range is `1001` through `3000`.

No new record may reuse a verse reference already present in the existing database.

No verse reference may be used more than once in the new records.

---

## 4. Required Output Files

Create all of the following:

### 4.1 Expansion JSONL

`daily_notes_of_grace_2000_expansion.jsonl`

- Exactly 2,000 lines.
- One valid JSON object per line.
- Contains only the new records.
- No Markdown fences.
- No comments.
- UTF-8.

### 4.2 Merged JSONL

`daily_notes_of_grace_3000_merged.jsonl`

- Existing records first, unchanged.
- New records appended in sequential ID order.
- Exactly 3,000 lines.

### 4.3 Merged JSON

`daily_notes_of_grace_3000_merged.json`

- Pretty-printed JSON array.
- Semantically identical to the merged JSONL file.

### 4.4 Human Review Sheet

`daily_notes_of_grace_2000_review.csv`

Include these columns:

- `id`
- `verse_reference`
- `primary_mood`
- `all_moods`
- `primary_social_mood`
- `all_social_moods`
- `primary_sleep_state`
- `all_sleep_states`
- `pastoralIntent`
- `tone`
- `intensity`
- `doctrinalEmphasis`
- `themes`
- `message_length`
- `verse_length`
- `encouragement_template`
- `verse_text`

The "primary" value is the first value in the corresponding array.

### 4.5 Audit Report

`daily_notes_of_grace_2000_audit.md`

The report must include:

- Total generated records.
- Merged total.
- ID range.
- Duplicate ID count.
- Duplicate verse-reference count.
- Duplicate encouragement count.
- Near-duplicate count.
- Invalid Scripture count.
- Invalid schema count.
- Screen-length failure count.
- Christ-centered-language failure count.
- Theological concern count.
- Distribution by primary mood.
- Distribution by all mood tags.
- Distribution by primary social mood.
- Distribution by all social tags.
- Distribution by primary sleep state.
- Distribution by all sleep tags.
- Distribution by pastoral intent.
- Distribution by doctrine.
- Distribution by tone.
- Distribution by intensity.
- Distribution by length tier.
- Distribution by theme.
- Distribution by Bible book.
- Old Testament/New Testament distribution.
- The review methodology.
- Any rejected or replaced records.
- A final pass/fail verdict.

The final verdict may be **PASS** only when all hard requirements have passed.

### 4.6 Validation Script

`validate_daily_notes_of_grace_3000.mjs`

The validation script must verify all hard requirements in this prompt and exit with a failure status when any hard requirement fails.

### 4.7 Import Readme

`DAILY_NOTES_OF_GRACE_DATABASE_IMPORT.md`

Explain:

- What each output file contains.
- Which file should replace the app's current JSON database after approval.
- Which file is the source-of-truth JSONL.
- How to run validation.
- The final counts.
- Any assumptions.
- The fact that a human theological review is still recommended before App Store release.

### 4.8 Rejected Candidates

`daily_notes_of_grace_rejected_candidates.jsonl`

Include candidates rejected during generation because of:

- Verse-context concerns.
- Duplicate or near-duplicate language.
- Theological weakness.
- Unsupported metadata.
- Excessive length.
- Poor mood relevance.
- Scripture mismatch.

Rejected records must not appear in the final expansion.

---

## 5. Exact Record Schema

Every record must use exactly this shape:

```json
{
  "id": 1001,
  "encouragement_template": "{name}, ...",
  "fallback_name": "Christian",
  "verse_text": "...",
  "verse_reference": "Book 1:1",
  "translation": "KJV",
  "book": "Book",
  "chapter": 1,
  "verse": 1,
  "testament": "Old Testament",
  "themes": ["Grace", "Faith"],
  "moods": ["Discouraged", "Tired"],
  "socialMoods": ["Withdrawn"],
  "sleepStates": ["Poor"],
  "pastoralIntent": "comfort",
  "doctrinalEmphasis": ["Christ's sufficiency", "grace"],
  "tone": "gentle",
  "intensity": "low-energy",
  "lengthTier": "screen-safe"
}
```

Do not add extra fields to production records.

Do not omit fields.

Field names and capitalization must match exactly.

---

## 6. Field Rules

### 6.1 `id`

- Integer.
- Unique.
- Sequential.
- Begins after the highest existing ID.

### 6.2 `encouragement_template`

- Must begin exactly with `{name},`.
- Must contain only one `{name}` placeholder.
- Must be original prose.
- Must be written in complete sentences.
- Must be Christ-centered.
- Must pastorally fit the verse and metadata.

### 6.3 `fallback_name`

Must always be:

```json
"Christian"
```

### 6.4 `verse_text`

- Must exactly match the approved KJV source after the cleaning rules in this prompt.
- Must be a single verse.
- Must be complete enough to stand responsibly in the reader.

### 6.5 `verse_reference`

- Must exactly match a key in `verses-1769.json`.
- Must be unique across all 3,000 merged records.

### 6.6 `translation`

Must always be:

```json
"KJV"
```

### 6.7 `book`

- Parsed from `verse_reference`.
- Must use the same canonical book spelling used in the reference.

### 6.8 `chapter`

- Integer parsed from `verse_reference`.

### 6.9 `verse`

- Integer parsed from `verse_reference`.

### 6.10 `testament`

Only:

- `Old Testament`
- `New Testament`

### 6.11 `themes`

- Minimum 2.
- Maximum 4.
- Values must come from the approved theme vocabulary.
- Themes must describe the actual note and Scripture.

### 6.12 `moods`

- Minimum 1.
- Maximum 4.
- The first mood is the primary mood.
- Secondary moods must be genuinely relevant.

### 6.13 `socialMoods`

- Minimum 1.
- Maximum 2.
- The first value is the primary social mood.

### 6.14 `sleepStates`

- Minimum 1.
- Maximum 2.
- The first value is the primary sleep state.

### 6.15 `pastoralIntent`

- Exactly one supported value.
- It describes what the note primarily does for the user.

### 6.16 `doctrinalEmphasis`

- Minimum 2.
- Maximum 4.
- Must be evident in the prose rather than merely attached as metadata.

### 6.17 `tone`

- Exactly one supported value.
- Must match the emotional and pastoral delivery.

### 6.18 `intensity`

- Exactly one supported value.
- Describes how demanding or emotionally weighty the note is for the reader.

### 6.19 `lengthTier`

- Must be calculated from the final note and verse lengths.
- All new production records must be either `short` or `screen-safe`.
- Do not produce `long` records in this expansion.

---

## 7. Controlled Vocabularies

Use only the values below.

### 7.1 Moods

- `Discouraged`
- `Tired`
- `Anxious`
- `Lonely`
- `Confused`
- `Afraid`
- `Overwhelmed`
- `Numb`
- `Calm`
- `Hopeful`
- `Joyful`
- `Thankful`

### 7.2 Social Moods

- `Isolated`
- `Withdrawn`
- `Sociable`

### 7.3 Sleep States

- `Poor`
- `Okay`
- `Good`

### 7.4 Pastoral Intents

- `assurance`
- `comfort`
- `rest`
- `wisdom`
- `courage`
- `renewal`
- `repentance`
- `gratitude`
- `perseverance`
- `prayer`

### 7.5 Doctrinal Emphases

- `Christ's sufficiency`
- `grace`
- `forgiveness`
- `finished work`
- `perseverance`
- `providence`
- `God's presence`
- `union with Christ`
- `Scripture wisdom`
- `resurrection hope`

### 7.6 Tones

- `gentle`
- `steady`
- `reflective`
- `joyful`
- `corrective`

### 7.7 Intensities

- `high-need`
- `low-energy`
- `steady`

### 7.8 Length Tiers

- `short`
- `screen-safe`

### 7.9 Approved Themes

- `Faith`
- `Grace`
- `Strength`
- `God's Presence`
- `Hope`
- `Guidance`
- `Identity in Christ`
- `Peace`
- `Salvation`
- `Joy`
- `Prayer`
- `Wisdom`
- `Love`
- `Perseverance`
- `Provision`
- `Renewal`
- `Comfort`
- `Contentment`

Do not use the generic theme `Encouragement` in new records.

---

## 8. Required Dataset Distribution

The expansion must be deliberately balanced. Do not simply tag records after writing them.

Plan the full matrix before drafting.

### 8.1 Primary Mood Targets

The first value in `moods` must meet these exact totals:

| Primary mood | New records |
|---|---:|
| Numb | 200 |
| Discouraged | 190 |
| Overwhelmed | 180 |
| Lonely | 175 |
| Tired | 170 |
| Anxious | 165 |
| Thankful | 165 |
| Joyful | 160 |
| Afraid | 150 |
| Calm | 150 |
| Hopeful | 150 |
| Confused | 145 |
| **Total** | **2,000** |

Secondary mood tags may broaden coverage, but they must not be used to disguise a poor primary distribution.

### 8.2 Primary Social Mood Targets

The first value in `socialMoods` should meet:

| Primary social mood | New records |
|---|---:|
| Isolated | 650 |
| Withdrawn | 700 |
| Sociable | 650 |
| **Total** | **2,000** |

A variance of up to 20 records per social category is acceptable if pastoral fit requires it, but the total must remain 2,000.

### 8.3 Primary Sleep State Targets

The first value in `sleepStates` should meet:

| Primary sleep state | New records |
|---|---:|
| Poor | 700 |
| Okay | 650 |
| Good | 650 |
| **Total** | **2,000** |

A variance of up to 20 records per sleep category is acceptable if needed for coherence.

### 8.4 Pastoral Intent Targets

| Pastoral intent | New records |
|---|---:|
| assurance | 240 |
| comfort | 320 |
| rest | 220 |
| wisdom | 180 |
| courage | 180 |
| renewal | 220 |
| repentance | 180 |
| gratitude | 180 |
| perseverance | 140 |
| prayer | 140 |
| **Total** | **2,000** |

These targets intentionally strengthen categories that were thin in the original database, especially repentance, perseverance, renewal, rest, assurance, and gratitude.

### 8.5 Tone Targets

| Tone | New records |
|---|---:|
| gentle | 600 |
| steady | 500 |
| reflective | 400 |
| joyful | 300 |
| corrective | 200 |
| **Total** | **2,000** |

Corrective notes must still be gospel-grounded and pastoral. They must never become scolding or condemnatory.

### 8.6 Intensity Targets

| Intensity | New records |
|---|---:|
| low-energy | 650 |
| steady | 850 |
| high-need | 500 |
| **Total** | **2,000** |

This expansion must correct the original database's overconcentration of `high-need` notes.

### 8.7 Length Targets

| Length tier | New records |
|---|---:|
| short | 800 |
| screen-safe | 1,200 |
| long | 0 |
| **Total** | **2,000** |

### 8.8 Testament Target

Aim for:

- New Testament: approximately 55%.
- Old Testament: approximately 45%.

Acceptable variance:

- Plus or minus 5 percentage points.

### 8.9 Book Diversity

- No single Bible book may provide more than 15% of the new records.
- Do not allow Psalms, Isaiah, John, or Romans to dominate the entire collection.
- Use broad biblical coverage where verses can be applied responsibly.
- Do not force unsuitable narrative fragments merely to increase book diversity.

---

## 9. Mood-Specific Pastoral Guidance

Every note must genuinely address its primary mood.

### 9.1 Discouraged

The user may feel defeated, delayed, disappointed, or unable to see fruit.

Emphasize:

- God's faithfulness.
- Grace in weakness.
- Christ's sufficiency.
- Perseverance under God's keeping care.
- Hope grounded in God's promises.

Useful intents:

- assurance
- comfort
- perseverance
- renewal

Avoid:

- Telling the user to simply try harder.
- Suggesting disappointment proves weak faith.
- Promising immediate circumstantial change.

### 9.2 Tired

The user may have low physical or emotional energy.

Emphasize:

- Christ's gentleness toward the weary.
- Mercy rather than performance.
- Rest.
- Small faithful steps.
- God carrying and sustaining His people.

Useful intents:

- rest
- comfort
- assurance
- prayer

Required style:

- Prefer short notes.
- Prefer gentle tone.
- Avoid dense argument.
- Avoid multiple commands.

### 9.3 Anxious

The user may be worried, unsettled, or mentally preoccupied.

Emphasize:

- God's fatherly care.
- Providence.
- Christ's nearness.
- Prayer.
- Trust grounded in God's character.

Useful intents:

- comfort
- assurance
- rest
- prayer

Avoid:

- "Just stop worrying."
- Treating anxiety as proof of unbelief.
- Guaranteeing that feared circumstances will not happen.

### 9.4 Lonely

The user may feel unseen, forgotten, or disconnected.

Emphasize:

- God's presence.
- Union with Christ.
- Being known and loved in Christ.
- The fellowship of God's people.
- Gentle movement toward trustworthy Christian community where appropriate.

Useful intents:

- comfort
- assurance
- prayer
- renewal

Avoid:

- "Jesus is all you need" used to dismiss the real value of human fellowship.
- Assuming the user has supportive family or church relationships.

### 9.5 Confused

The user may not know what to do or how to interpret a situation.

Emphasize:

- Christ as wisdom.
- Scripture as light.
- Humility.
- Prayer for guidance.
- The next faithful step rather than total certainty.

Useful intents:

- wisdom
- prayer
- assurance

Avoid:

- "Follow your heart."
- Presenting personal impressions as divine revelation.
- Claiming that every decision will become obvious.

### 9.6 Afraid

The user may feel threatened, vulnerable, or fearful about the future.

Emphasize:

- God as refuge.
- Christ's lordship.
- Providence.
- Courage that rests in God rather than self-confidence.
- Resurrection hope.

Useful intents:

- courage
- assurance
- comfort
- prayer

Avoid:

- Promising physical safety in every circumstance.
- Equating courage with absence of fear.

### 9.7 Overwhelmed

The user may feel burdened by too many needs or responsibilities.

Emphasize:

- Christ receiving needy people.
- God's sustaining mercy.
- Burden-bearing.
- Prayer.
- One faithful step at a time.

Useful intents:

- rest
- comfort
- prayer
- assurance

Required style:

- Keep language simple.
- Do not give a list of tasks.
- Do not add pressure.

### 9.8 Numb

The user may feel spiritually dry, emotionally flat, distant, or unable to respond.

Emphasize:

- God's restoring grace.
- Christ's faithfulness when feelings are weak.
- Prayer even when words are few.
- The Spirit's work.
- Hope that does not depend on emotional intensity.

Useful intents:

- renewal
- assurance
- prayer
- repentance, when handled gently

Avoid:

- Assuming numbness is deliberate rebellion.
- Demanding emotional enthusiasm.
- Treating spiritual feeling as the ground of salvation.

### 9.9 Calm

The user may feel settled and receptive.

Emphasize:

- Abiding in Christ.
- Gratitude.
- Worship.
- Quiet obedience.
- Using peaceful days for communion with God.

Useful intents:

- gratitude
- prayer
- wisdom
- perseverance

Avoid:

- Turning calm into spiritual complacency.
- Inventing a crisis where none was reported.

### 9.10 Hopeful

The user may feel encouraged and forward-looking.

Emphasize:

- Hope anchored in Christ, not optimism.
- God's promises.
- Perseverance.
- Resurrection.
- Faithful action.

Useful intents:

- perseverance
- gratitude
- courage
- assurance

Avoid:

- Guaranteeing a preferred outcome.
- Treating hope as confidence in self.

### 9.11 Joyful

The user may feel glad, energized, or encouraged.

Emphasize:

- Christ as the source and center of joy.
- Worship.
- Thanksgiving.
- Love and service.
- Remembering grace.

Useful intents:

- gratitude
- prayer
- perseverance

Avoid:

- Generic celebration detached from the gospel.
- Assuming joy means the user has no burdens.

### 9.12 Thankful

The user is consciously recognizing gifts and mercy.

Emphasize:

- Grace.
- Providence.
- Praise.
- Thanksgiving.
- God's gifts leading to worship and generosity.

Useful intents:

- gratitude
- prayer
- assurance

Avoid:

- Making gratitude a way of earning blessing.
- Treating thanksgiving as denial of pain.

---

## 10. Social-Mood Guidance

### 10.1 Isolated

Use notes that:

- Emphasize God's nearness.
- Affirm that the user is known in Christ.
- Avoid pressuring immediate social performance.
- May gently commend Christian fellowship without assuming it is easy or available.

Best pairings:

- Lonely
- Afraid
- Numb
- Discouraged

### 10.2 Withdrawn

Use notes that:

- Acknowledge low social energy.
- Emphasize rest, being known, and being gently drawn near.
- Offer one small faithful response.

Best pairings:

- Tired
- Discouraged
- Overwhelmed
- Numb
- Anxious

### 10.3 Sociable

Use notes that:

- Direct energy toward love, service, fellowship, encouragement, and witness.
- Keep Christ and grace central.
- Avoid turning sociability into performance or popularity.

Best pairings:

- Joyful
- Thankful
- Hopeful
- Calm

---

## 11. Sleep-State Guidance

### 11.1 Poor

The note should:

- Usually be short.
- Usually use gentle tone.
- Usually use low-energy intensity.
- Emphasize mercy, rest, patience, and small faithful steps.
- Avoid dense theological explanation.
- Avoid heavy correction unless absolutely necessary.

### 11.2 Okay

The note may:

- Use balanced length.
- Combine encouragement and one practical response.
- Use gentle, steady, or reflective tone.

### 11.3 Good

The note may:

- Invite gratitude, worship, service, readiness, or joyful obedience.
- Use steady or joyful tone.
- Be active without becoming performance-centered.

---

## 12. Theological Requirements

The database must be recognizably Christian and centered on Jesus Christ.

### 12.1 Every Record Must Point To Christ

Every `encouragement_template` must explicitly include at least one clear reference to:

- Jesus
- Jesus Christ
- Christ
- Lord Jesus
- Saviour
- Son of God
- Redeemer
- the cross
- the gospel
- resurrection, clearly referring to Christ

Merely mentioning "faith," "hope," "God," or "the Lord" is not sufficient for this requirement.

The reference to Christ must be meaningful, not an artificial phrase added to pass validation.

### 12.2 Every Record Must Include Gospel Grounding

Every record must clearly include at least one of:

- Grace.
- Mercy.
- Forgiveness.
- Christ's finished work.
- The cross.
- Union with Christ.
- Salvation.
- Resurrection hope.
- God's covenant faithfulness fulfilled in Christ.
- Christ's sufficiency for the believer.

### 12.3 Reformed/Calvinistic Direction

The notes should naturally reflect:

- God's sovereignty.
- God's providence.
- Salvation by grace.
- Christ's sufficiency.
- The believer's dependence on God.
- God's preserving faithfulness.
- Obedience as fruit of grace, not the ground of acceptance.
- The authority and sufficiency of Scripture.
- Honest treatment of sin.
- Repentance joined to mercy in Christ.
- Hope grounded outside the user's changing emotions.

Do not turn the notes into denominational polemics. They should be warmly and recognizably Reformed without repeatedly naming Calvinism or confessional documents.

### 12.4 Law And Gospel

Corrective or repentance notes must:

1. Name sin truthfully where the verse warrants it.
2. Avoid minimizing sin.
3. Avoid leaving the user under bare condemnation.
4. Point to repentance, forgiveness, cleansing, and mercy in Christ.
5. Present obedience as a response to grace.

### 12.5 Assurance

Assurance notes must:

- Ground confidence in Christ and God's promises.
- Avoid presumption.
- Avoid claiming every person is saved regardless of faith and repentance.
- Avoid grounding assurance in emotional intensity or personal performance.

### 12.6 Suffering

Do not imply:

- Faithful Christians avoid suffering.
- Suffering necessarily comes from personal sin.
- Prayer guarantees immediate healing or changed circumstances.
- A difficult emotion proves spiritual failure.

### 12.7 Providence

Affirm God's sovereign care without:

- Calling evil good.
- Pretending painful events are easy.
- Claiming knowledge of God's hidden purpose in a specific event.
- Using "everything happens for a reason" as a substitute for biblical care.

---

## 13. Prohibited Theology And Language

Reject any note containing or implying:

- Prosperity-gospel promises.
- Manifestation.
- Law of attraction.
- Karma.
- "The universe" as a spiritual power.
- Salvation by works.
- Acceptance earned through performance.
- "Believe in yourself" as the ground of hope.
- "You are enough by yourself."
- "Follow your heart."
- "Live your truth."
- Universal salvation without faith and repentance.
- The user becoming an angel.
- God needing another angel.
- Guaranteed healing.
- Guaranteed financial provision in a particular form.
- Guaranteed reconciliation.
- Guaranteed protection from suffering.
- Extra-biblical revelation such as "God told me your breakthrough is coming."
- Predictions about the user's future.
- Claims that the user lacks faith because they feel anxious, depressed, tired, lonely, afraid, overwhelmed, or numb.
- Dismissal of medical, mental health, emergency, or pastoral care.
- Political campaigning.
- Culture-war language.
- Denominational attacks.
- Gender, marital, parental, employment, or health assumptions not provided by the user.

---

## 14. Encouragement Writing Standard

### 14.1 Required Opening

Every note begins:

```text
{name},
```

The first sentence should acknowledge the user's likely situation without pretending to know details that were not provided.

Good:

> {name}, the weight you feel today is not hidden from the Lord.

Bad:

> {name}, God caused this exact problem because He wants to teach you a lesson.

### 14.2 Recommended Structure

Use three to five concise sentences:

1. Gentle recognition of the condition.
2. Biblical truth about God, grace, or the believer's need.
3. Explicit focus on Christ and the gospel.
4. One simple invitation to trust, pray, rest, repent, worship, or take a faithful step.

This structure is guidance, not a sentence template to repeat mechanically.

### 14.3 Voice

Use:

- Warm pastoral clarity.
- Direct second-person address.
- Plain modern English.
- Reverent references to God and Christ.
- `Saviour` spelling where that word is used.
- Short and digestible statements.

Avoid:

- Sermon-like verbosity.
- Archaic imitation outside the KJV quotation.
- Clichés.
- Excessive adjectives.
- Exclamation marks.
- Rhetorical hype.
- Repetitive sentence patterns.
- Overuse of semicolons.
- Formulaic four-sentence permutations.

### 14.4 Personalization

- Use only the `{name}` placeholder.
- Do not include other dynamic placeholders.
- Do not assume age, gender, marriage, parenthood, occupation, church role, diagnosis, or life event.
- The note must read naturally when `{name}` becomes either a person's name or `Christian`.

### 14.5 Response Invitation

End with one modest response, for example:

- Rest in Christ.
- Bring this fear to the Lord in prayer.
- Ask God for the next faithful step.
- Receive the mercy Christ has secured.
- Let this promise steady you today.
- Return to the Saviour rather than hiding in shame.
- Give thanks and use today's strength in love.

Do not end every note with the same phrase.

---

## 15. Length And Screen-Fit Requirements

Length must be calculated after replacing `{name}` with `Christian`.

### 15.1 Encouragement Length

Preferred:

- 220 to 340 characters.

Hard maximum:

- 360 characters.

Hard minimum:

- 190 characters.

### 15.2 Scripture Length

Preferred:

- 55 to 170 characters.

Hard maximum:

- 190 characters.

### 15.3 Short Tier

Use `short` when:

- Rendered encouragement length is 270 characters or fewer.
- Scripture length is 130 characters or fewer.

### 15.4 Screen-Safe Tier

Use `screen-safe` when:

- Encouragement is within the 360-character maximum.
- Scripture is within the 190-character maximum.
- It does not qualify as short.

### 15.5 Long Tier

Do not produce any new `long` records.

---

## 16. Scripture Selection And Verification

### 16.1 Approved Source

Use only `verses-1769.json`.

Do not use:

- Memory.
- Search-engine snippets.
- Another Bible translation.
- AI-paraphrased Scripture.
- A modernized KJV.

### 16.2 Cleaning Rules

The supplied source contains editorial markers.

Apply only these cleaning steps:

1. Remove a standalone leading or inline `#` marker and its following space.
2. Remove square brackets while preserving the words inside them.
3. Collapse repeated whitespace.
4. Trim leading and trailing whitespace.

Example:

```text
# And God saw the light, that [it was] good:
```

becomes:

```text
And God saw the light, that it was good:
```

Do not otherwise change spelling, capitalization, punctuation, or wording.

### 16.3 Verse Integrity

Reject a verse when:

- It ends in a comma or colon and is clearly an incomplete fragment.
- Its meaning depends on omitted prior text.
- It is a greeting or personal travel detail without devotional relevance.
- It is a genealogy.
- It is an isolated narrative detail.
- The speaker is Satan, a deceiver, or an ungodly character and the words could be mistaken for God's promise.
- It is a human statement that would be falsely presented as God's direct promise.
- It is primarily violent, sexual, imprecatory, condemnatory, or obscure in a way unsuitable for this app.
- It cannot be responsibly connected to Christ and the selected mood.
- Its application would require ignoring the verse's context.

### 16.4 Canonical And Christological Care

- Do not force every Old Testament verse into a direct messianic prophecy.
- You may connect Old Testament truth to Christ through clear canonical themes such as covenant, refuge, sacrifice, wisdom, kingship, shepherding, mercy, promise, and redemption.
- Do not claim a verse directly predicts Christ unless that is exegetically defensible.
- New Testament verses about Christ should be preferred for explicit gospel claims.

### 16.5 Reference Uniqueness

Before selecting a verse:

1. Exclude every `verse_reference` already used by the existing 1,000 records.
2. Exclude every reference already selected for the expansion.
3. Confirm the exact reference exists in `verses-1769.json`.

---

## 17. Metadata Coherence Rules

Metadata must be assigned from the meaning of the final note and verse.

Do not generate prose first and attach random popular tags.

### 17.1 Mood Coherence

The note must be useful for every listed mood.

If the note only fits one mood, list one mood.

Do not add four moods merely to improve coverage.

### 17.2 Social Coherence

Examples:

- A note about being known and not forsaken may fit `Isolated`.
- A note about rest and low energy may fit `Withdrawn`.
- A note about loving and encouraging others may fit `Sociable`.

### 17.3 Sleep Coherence

Examples:

- Short, gentle mercy notes fit `Poor`.
- Balanced guidance notes fit `Okay`.
- Gratitude, worship, and service notes may fit `Good`.

### 17.4 Intent Coherence

The `pastoralIntent` must identify the note's main action:

- `assurance`: stabilizes confidence in Christ and God's promises.
- `comfort`: meets sorrow, loneliness, weakness, or pain with mercy.
- `rest`: reduces burden and invites dependence on Christ.
- `wisdom`: guides thinking and decisions through Scripture.
- `courage`: strengthens the user to face fear faithfully.
- `renewal`: speaks to numbness, dryness, restoration, or fresh obedience.
- `repentance`: calls the user away from sin and toward mercy in Christ.
- `gratitude`: directs gifts and joy toward thanksgiving and worship.
- `perseverance`: helps the user continue under delay, hardship, or ordinary faithfulness.
- `prayer`: directs the user to call upon God.

### 17.5 Doctrine Coherence

Every doctrinal tag must be visible in the actual note:

- Do not tag `finished work` without cross, redemption, completed atonement, or salvation language.
- Do not tag `union with Christ` without in-Christ identity, belonging, nearness, life, or acceptance language.
- Do not tag `resurrection hope` without resurrection, risen Christ, eternal life, or future hope language.
- Do not tag `forgiveness` without sin, cleansing, pardon, confession, repentance, or mercy language.

---

## 18. Doctrinal Coverage Requirements

Across the 2,000 new records, target at least:

- `Christ's sufficiency`: 70% of records.
- `grace`: 35%.
- `finished work`: 25%.
- `forgiveness`: 15%.
- `perseverance`: 25%.
- `providence`: 25%.
- `God's presence`: 25%.
- `union with Christ`: 20%.
- `Scripture wisdom`: 15%.
- `resurrection hope`: 15%.

These percentages overlap because each record has two to four doctrinal tags.

Every record must contain at least one of these explicit gospel-grounding tags:

- `grace`
- `forgiveness`
- `finished work`
- `union with Christ`
- `resurrection hope`
- `Christ's sufficiency`

---

## 19. Diversity And Anti-Duplication Requirements

The database must not feel like a sentence-template generator.

### 19.1 Hard Uniqueness

Require:

- Zero duplicate IDs.
- Zero duplicate verse references.
- Zero exact duplicate encouragements.
- Zero exact duplicate cleaned Scripture texts paired to different references unless the source itself legitimately repeats the verse and the references are different. Prefer not to use repeated-source wording.

### 19.2 Near-Duplicate Review

Normalize encouragements by:

- Lowercasing.
- Replacing `{name}`.
- Removing punctuation.
- Collapsing whitespace.

Flag near duplicates using more than one method, such as:

- Word n-gram similarity.
- Token-set similarity.
- Sequence similarity.
- Repeated opening and closing phrases.

Every flagged pair must be manually reviewed.

Rewrite or reject records that:

- Communicate the same idea in nearly identical wording.
- Reuse the same sentence skeleton.
- Differ only by synonyms.
- Reuse three or more substantial phrases from another note.

### 19.3 Phrase Repetition

Audit common phrases.

No distinctive sentence or clause should recur across dozens of records.

The following important phrases may recur occasionally but must not become a mechanical template:

- Look to Christ.
- Rest in Christ.
- Christ is sufficient.
- The Lord is faithful.
- You are not alone.
- Take heart.
- Keep walking.

Vary syntax, pastoral approach, Scripture application, and response invitation.

### 19.4 Comparison With Existing Records

Near-duplicate detection must compare:

- New records against new records.
- New records against all existing 1,000 records.

---

## 20. Generation Workflow

Follow this workflow.

### Phase 1: Ingest And Profile

1. Parse the existing 1,000 records.
2. Parse and clean the KJV source.
3. Build the exclusion list of existing references.
4. Profile existing mood, theme, doctrine, intent, tone, intensity, book, and length distributions.
5. Confirm the new-record ID range.

### Phase 2: Build The Coverage Matrix

Create a planning table for all 2,000 records before final writing.

Each planned row should include:

- ID.
- Candidate verse.
- Primary mood.
- Secondary moods.
- Primary social mood.
- Secondary social mood if any.
- Primary sleep state.
- Secondary sleep state if any.
- Pastoral intent.
- Tone.
- Intensity.
- Desired doctrines.
- Desired themes.
- Length tier.

Validate distribution totals before drafting.

### Phase 3: Verse Review

For each candidate verse:

1. Confirm source accuracy.
2. Confirm it is not already used.
3. Confirm it is not a fragment.
4. Confirm the speaker and context.
5. Confirm devotional suitability.
6. Confirm mood and pastoral fit.
7. Reject weak candidates.

### Phase 4: Draft In Batches

Draft in batches of no more than 100 records.

After each batch:

- Validate JSON.
- Validate schema.
- Validate lengths.
- Validate Scripture.
- Validate distributions.
- Validate explicit Christ language.
- Validate gospel grounding.
- Run duplicate and near-duplicate checks.
- Review mood relevance.
- Review theological safety.

Do not wait until all 2,000 records exist to discover systematic defects.

### Phase 5: Editorial Review

For every batch, perform:

- Grammar review.
- Pastoral-tone review.
- Theological review.
- Verse-context review.
- Personalization review.
- Repetition review.
- Screen-fit review.

At minimum, manually inspect:

- 20 records for each primary mood.
- 20 records for each pastoral intent.
- Every corrective note.
- Every repentance note.
- Every record flagged by automated checks.
- Every record using an Old Testament verse whose Christ connection is not immediately obvious.

### Phase 6: Merge And Final Validation

1. Preserve the existing records unchanged.
2. Append the validated expansion.
3. Confirm exactly 3,000 records.
4. Confirm IDs are sequential.
5. Confirm all references are unique.
6. Confirm all hard validations pass.
7. Produce all required output files.

---

## 21. Automated Hard Validation Rules

The final validation script must fail if any of these conditions is true:

### Counts And IDs

- Expansion count is not exactly 2,000.
- Merged count is not exactly 3,000.
- IDs are missing, duplicated, non-integer, or non-sequential.

### Schema

- A required field is missing.
- An extra production field is present.
- A controlled value is unsupported.
- An array is outside its allowed size.

### Personalization

- A note does not start with `{name},`.
- A note contains no `{name}` placeholder.
- A note contains more than one `{name}` placeholder.
- `fallback_name` is not `Christian`.

### Scripture

- A reference does not exist in `verses-1769.json`.
- Verse text does not exactly match the cleaned source.
- Translation is not `KJV`.
- Book, chapter, verse, or testament metadata is incorrect.
- A verse reference is duplicated.

### Length

- Rendered note is below 190 characters.
- Rendered note exceeds 360 characters.
- Verse text exceeds 190 characters.
- A new record has `lengthTier: "long"`.
- The assigned length tier is inconsistent with calculated length.

### Theology

- A note lacks explicit Christ language.
- A note lacks explicit gospel grounding.
- A prohibited phrase or theological pattern is detected.
- A `doctrinalEmphasis` value has no textual support.

### Duplication

- Exact duplicate encouragements exist.
- Unresolved near-duplicate pairs exist.

### Distribution

- Primary mood totals do not equal the required 2,000-record plan.
- Pastoral intent totals do not equal the required plan.
- Tone totals do not equal the required plan.
- Intensity totals do not equal the required plan.
- Length-tier totals do not equal the required plan.
- Social, sleep, testament, doctrine, or book diversity falls outside the allowed tolerances.

---

## 22. Theological Review Rubric

Score each record pass/fail on all questions:

1. Does the note accurately fit the selected verse?
2. Is the verse used in a contextually responsible way?
3. Is Jesus Christ explicit and central?
4. Is the user's hope grounded outside themselves?
5. Is the gospel present rather than generic positivity?
6. Is grace the ground of acceptance and obedience?
7. Does the note fit the user's primary mood?
8. Does the tone fit the sleep and social context?
9. Does it avoid promises Scripture does not make?
10. Is the response invitation simple and pastorally appropriate?
11. Does it avoid medical or mental-health diagnosis?
12. Does it avoid shame and spiritual-performance pressure?
13. Is the writing distinct from other records?
14. Will the note read naturally with either a personal name or `Christian`?
15. Is it concise enough for the app?

A record failing any of questions 1 through 9 must be rewritten or rejected.

---

## 23. Examples

These are format and quality examples only. Do not copy them into the final database and do not create superficial variations of them.

### 23.1 Good: Anxious + Withdrawn + Poor Sleep

```json
{
  "id": 1001,
  "encouragement_template": "{name}, a tired mind can make tomorrow feel heavier than it is. Your peace does not depend on solving every possibility before you rest. Jesus Christ holds His people with a care stronger than their anxious thoughts, and His grace is not exhausted by weakness. Bring Him the fear you can name, and trust Him with what you cannot.",
  "fallback_name": "Christian",
  "verse_text": "Casting all your care upon him; for he careth for you.",
  "verse_reference": "1 Peter 5:7",
  "translation": "KJV",
  "book": "1 Peter",
  "chapter": 5,
  "verse": 7,
  "testament": "New Testament",
  "themes": ["Peace", "Prayer", "Grace", "God's Presence"],
  "moods": ["Anxious", "Tired", "Overwhelmed"],
  "socialMoods": ["Withdrawn"],
  "sleepStates": ["Poor"],
  "pastoralIntent": "rest",
  "doctrinalEmphasis": ["Christ's sufficiency", "grace", "providence"],
  "tone": "gentle",
  "intensity": "low-energy",
  "lengthTier": "screen-safe"
}
```

This example is structurally good, but if the verse is already present in the supplied existing database, it must not be reused.

### 23.2 Good: Thankful + Sociable + Good Sleep

```text
{name}, today's strength is a gift before it becomes an achievement. Jesus Christ has given you more than a pleasant moment; in Him you have mercy, life, and a hope that cannot decay. Let gratitude turn outward in worship and in patient love for the people God places near you. Receive the day with thanks, and spend its energy in grace.
```

Why it works:

- It does not praise self-sufficiency.
- Christ is explicit.
- Gratitude moves toward worship and love.
- It fits sociable energy and good sleep.

### 23.3 Good: Repentance Without Despair

```text
{name}, hiding sin cannot give the peace that confession offers. The Lord's holiness tells the truth about what is wrong, and His mercy keeps repentance from becoming despair. Jesus Christ received the judgment sinners could not bear, so you may return to God without pretending or bargaining. Confess what is true, and rest in the cleansing He provides.
```

Why it works:

- Sin is not minimized.
- Christ's work is the ground of mercy.
- Repentance is not performance.
- The user is not left under condemnation.

### 23.4 Bad: Generic Self-Help

```text
{name}, you are stronger than you think. Believe in yourself and trust that the universe is preparing better things for you.
```

Reject because:

- Not Christian.
- Not biblical.
- Self-trust replaces Christ.
- Uses manifestation language.
- Makes an unsupported future promise.

### 23.5 Bad: Harsh Correction

```text
{name}, your anxiety proves that you are not trusting God enough. Stop worrying and have more faith.
```

Reject because:

- Shaming.
- Pastorally harmful.
- Theologically shallow.
- No gospel.
- No Christ.
- Treats an emotion as proof of spiritual failure.

### 23.6 Bad: False Promise

```text
{name}, Jesus will remove this problem today if you believe strongly enough.
```

Reject because:

- Guarantees an outcome Scripture does not promise.
- Makes blessing depend on emotional intensity.
- Resembles prosperity teaching.

---

## 24. Work Standards

- Do the work in files, not in a single enormous chat response.
- Keep an audit trail.
- Do not overwrite the existing production database.
- Preserve rejected candidates separately.
- Never mark the work complete because a generation script ran.
- Completion requires editorial, theological, contextual, schema, uniqueness, and screen-fit review.
- If a target distribution conflicts with theological or contextual accuracy, preserve accuracy, document the variance, and replace candidates until the allowed tolerance is met.
- Do not silently weaken requirements to reach 2,000 records.

---

## 25. Final Response Required From You

When the work is complete, respond with:

1. Links to every generated file.
2. Total expansion record count.
3. Total merged record count.
4. New ID range.
5. Validation result.
6. Theological audit result.
7. Duplicate and near-duplicate results.
8. Screen-fit result.
9. Distribution summary.
10. A short list of any remaining human-review recommendations.

Do not paste the entire database into the final message.

Do not claim the database is production-ready if any hard validation fails.

# END OF PROMPT FOR THE DATABASE AGENT

---

## Files Nelson Should Attach To The New Chat

Attach these files with the prompt:

1. `src/data/encouragements.json`
2. `verses-1769.json`
3. `notes-mood-mapping-audit.md`
4. `UX-PRD.md`
5. `scripts/validate-data.mjs`
6. `App.js`

The most important files are the existing database and the KJV source. Without those two files, the new agent cannot reliably prevent duplicate verses or guarantee exact Scripture wording.
