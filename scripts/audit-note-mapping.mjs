import data from "../src/data/encouragements.json" with { type: "json" };

const TODAY_MESSAGE_MAX_CHARS = 360;
const TODAY_VERSE_MAX_CHARS = 190;

const moodOptions = [
  {
    keywords: ["discouraged", "weary", "endure", "promise", "hope", "standing"],
    label: "Discouraged",
    themes: ["Hope", "Perseverance", "Comfort", "Renewal"]
  },
  {
    keywords: ["weary", "rest", "weakness", "strength", "tired"],
    label: "Tired",
    themes: ["Strength", "Comfort", "Peace", "Renewal"]
  },
  {
    keywords: ["anxious", "fear", "worry", "care", "peace", "trust"],
    label: "Anxious",
    themes: ["Peace", "Faith", "God's Presence", "Guidance"]
  },
  {
    keywords: ["alone", "lonely", "presence", "known", "near"],
    label: "Lonely",
    themes: ["God's Presence", "Love", "Comfort", "Identity in Christ"]
  },
  {
    keywords: ["wisdom", "guidance", "confused", "path", "lead"],
    label: "Confused",
    themes: ["Wisdom", "Guidance", "Faith", "Prayer"]
  },
  {
    keywords: ["afraid", "fear", "refuge", "protect", "safe"],
    label: "Afraid",
    themes: ["Peace", "God's Presence", "Strength", "Faith"]
  },
  {
    keywords: ["overwhelmed", "burden", "heavy", "pressure", "weak", "help", "strength"],
    label: "Overwhelmed",
    themes: ["Comfort", "Strength", "Peace", "Prayer"]
  },
  {
    keywords: ["numb", "empty", "dry", "distant", "renew", "alive"],
    label: "Numb",
    themes: ["Renewal", "God's Presence", "Grace", "Hope"]
  },
  {
    keywords: ["calm", "peace", "rest", "quiet", "trust"],
    label: "Calm",
    themes: ["Peace", "Contentment", "Faith", "God's Presence"]
  },
  {
    keywords: ["hope", "promise", "future", "persevere"],
    label: "Hopeful",
    themes: ["Hope", "Perseverance", "Renewal", "Faith"]
  },
  {
    keywords: ["joy", "praise", "delight", "glad"],
    label: "Joyful",
    themes: ["Joy", "Contentment", "Love", "Grace"]
  },
  {
    keywords: ["thank", "thankful", "praise", "worship"],
    label: "Thankful",
    themes: ["Joy", "Prayer", "Grace", "Contentment"]
  }
];

const socialOptions = ["Isolated", "Withdrawn", "Sociable"];
const sleepOptions = ["Poor", "Okay", "Good"];

const concernPatterns = [
  ["self_help", /\b(self[- ]?help|manifesting|law of attraction|universe|karma)\b/i],
  ["performance_framing", /\b(earn god'?s love|earn his love|deserve god|deserve his)\b/i],
  ["therapeutic_without_gospel", /\b(you are enough by yourself|believe in yourself|your truth)\b/i],
  ["works_as_ground", /\b(saved by your|accepted because you|justified by your)\b/i]
];

const christTerms = /\b(Christ|Jesus|Saviour|Savior|Son of God|Lord Jesus|cross|gospel|redeemer|redemption|salvation)\b/i;
const graceTerms = /\b(grace|mercy|forgive|forgiveness|repent|repentance|saved|salvation|cross|finished work)\b/i;
const reformedComfortTerms = /\b(kept|holds|uphold|faithful|sovereign|promise|covenant|shepherd|refuge|finished work|not by your performance)\b/i;

function renderMessage(item, name = "Christian") {
  return item.encouragement_template.replaceAll("{name}", name || item.fallback_name || "Christian");
}

function searchText(item) {
  return [
    renderMessage(item),
    item.verse_text,
    item.verse_reference,
    ...(Array.isArray(item.themes) ? item.themes : [])
  ].join(" ").toLowerCase();
}

function isEligibleForToday(item) {
  return renderMessage(item).length <= TODAY_MESSAGE_MAX_CHARS && item.verse_text.length <= TODAY_VERSE_MAX_CHARS;
}

function countBy(items, getValues) {
  const counts = new Map();

  for (const item of items) {
    const values = getValues(item);
    for (const value of Array.isArray(values) ? values : [values]) {
      if (!value) {
        continue;
      }
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function percentile(values, ratio) {
  if (!values.length) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) * ratio)];
}

function moodMatches(items, mood) {
  return items.filter((item) => item.moods?.includes(mood.label));
}

const eligibleItems = data.filter(isEligibleForToday);
const messageLengths = data.map((item) => renderMessage(item).length);
const verseLengths = data.map((item) => item.verse_text.length);
const eligibleMessageLengths = eligibleItems.map((item) => renderMessage(item).length);
const eligibleVerseLengths = eligibleItems.map((item) => item.verse_text.length);

const concerns = [];
for (const item of data) {
  const text = `${renderMessage(item)} ${item.verse_text}`;
  for (const [label, pattern] of concernPatterns) {
    if (pattern.test(text)) {
      concerns.push({ id: item.id, label, reference: item.verse_reference });
    }
  }
}

const recordsWithoutChristTerms = data.filter((item) => !christTerms.test(renderMessage(item)));
const recordsWithoutGraceTerms = data.filter((item) => !graceTerms.test(renderMessage(item)));
const recordsWithoutReformedComfortTerms = data.filter((item) => !reformedComfortTerms.test(renderMessage(item)));
const genericThemeRecords = data.filter((item) => item.themes?.includes("Encouragement"));
const longVerseRecords = data.filter((item) => item.verse_text.length > TODAY_VERSE_MAX_CHARS);
const longMessageRecords = data.filter((item) => renderMessage(item).length > TODAY_MESSAGE_MAX_CHARS);

const summary = {
  totalRecords: data.length,
  eligibleForTodayScreen: eligibleItems.length,
  excludedByCurrentLengthRules: data.length - eligibleItems.length,
  messageLength: {
    p50: percentile(messageLengths, 0.5),
    p75: percentile(messageLengths, 0.75),
    p90: percentile(messageLengths, 0.9),
    p95: percentile(messageLengths, 0.95),
    max: Math.max(...messageLengths)
  },
  eligibleMessageLength: {
    p50: percentile(eligibleMessageLengths, 0.5),
    p75: percentile(eligibleMessageLengths, 0.75),
    p90: percentile(eligibleMessageLengths, 0.9),
    p95: percentile(eligibleMessageLengths, 0.95),
    max: Math.max(...eligibleMessageLengths)
  },
  verseLength: {
    p50: percentile(verseLengths, 0.5),
    p75: percentile(verseLengths, 0.75),
    p90: percentile(verseLengths, 0.9),
    p95: percentile(verseLengths, 0.95),
    max: Math.max(...verseLengths)
  },
  eligibleVerseLength: {
    p50: percentile(eligibleVerseLengths, 0.5),
    p75: percentile(eligibleVerseLengths, 0.75),
    p90: percentile(eligibleVerseLengths, 0.9),
    p95: percentile(eligibleVerseLengths, 0.95),
    max: Math.max(...eligibleVerseLengths)
  },
  theologicalSignals: {
    recordsWithoutChristTerms: recordsWithoutChristTerms.length,
    recordsWithoutGraceTerms: recordsWithoutGraceTerms.length,
    recordsWithoutReformedComfortTerms: recordsWithoutReformedComfortTerms.length,
    concernPatternHits: concerns.length
  },
  technicalGaps: {
    directMoodFieldsPresent: data.every((item) => Array.isArray(item.moods)),
    directSocialMoodFieldsPresent: data.every((item) => Array.isArray(item.socialMoods)),
    directSleepFieldsPresent: data.every((item) => Array.isArray(item.sleepStates)),
    directIntensityFieldPresent: data.every((item) => typeof item.intensity === "string"),
    directPastoralIntentFieldPresent: data.every((item) => typeof item.pastoralIntent === "string")
  },
  longContent: {
    longMessages: longMessageRecords.length,
    longVerses: longVerseRecords.length
  },
  genericThemeRecords: genericThemeRecords.length,
  socialOptions,
  sleepOptions
};

const moodCoverage = moodOptions.map((mood) => {
  const allMatches = moodMatches(data, mood);
  const eligibleMatches = moodMatches(eligibleItems, mood);
  return {
    eligibleMatches: eligibleMatches.length,
    label: mood.label,
    totalMatches: allMatches.length
  };
});

const report = {
  summary,
  moodCoverage,
  socialCoverage: socialOptions.map((label) => ({
    eligibleMatches: eligibleItems.filter((item) => item.socialMoods?.includes(label)).length,
    label,
    totalMatches: data.filter((item) => item.socialMoods?.includes(label)).length
  })),
  sleepCoverage: sleepOptions.map((label) => ({
    eligibleMatches: eligibleItems.filter((item) => item.sleepStates?.includes(label)).length,
    label,
    totalMatches: data.filter((item) => item.sleepStates?.includes(label)).length
  })),
  themeCounts: countBy(data, (item) => item.themes),
  eligibleThemeCounts: countBy(eligibleItems, (item) => item.themes),
  pastoralIntentCounts: countBy(data, (item) => item.pastoralIntent),
  toneCounts: countBy(data, (item) => item.tone),
  intensityCounts: countBy(data, (item) => item.intensity),
  lengthTierCounts: countBy(data, (item) => item.lengthTier),
  bookCounts: countBy(data, (item) => item.book),
  testamentCounts: countBy(data, (item) => item.testament),
  examples: {
    genericThemeRecordIds: genericThemeRecords.slice(0, 15).map((item) => item.id),
    longVerseRecordIds: longVerseRecords.slice(0, 15).map((item) => item.id),
    longMessageRecordIds: longMessageRecords.slice(0, 15).map((item) => item.id),
    recordsWithoutChristTerms: recordsWithoutChristTerms.slice(0, 15).map((item) => item.id),
    recordsWithoutGraceTerms: recordsWithoutGraceTerms.slice(0, 15).map((item) => item.id),
    concernPatternHits: concerns.slice(0, 15)
  }
};

console.log(JSON.stringify(report, null, 2));
