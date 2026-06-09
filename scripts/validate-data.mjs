import data from "../src/data/encouragements.json" with { type: "json" };

const errors = [];
const references = new Set();
const validDoctrinalEmphasis = new Set([
  "Christ's sufficiency",
  "grace",
  "forgiveness",
  "finished work",
  "perseverance",
  "providence",
  "God's presence",
  "union with Christ",
  "Scripture wisdom",
  "resurrection hope"
]);
const validIntensities = new Set(["high-need", "low-energy", "steady"]);
const validLengthTiers = new Set(["long", "screen-safe", "short"]);
const validMoods = new Set([
  "Discouraged",
  "Tired",
  "Anxious",
  "Lonely",
  "Confused",
  "Afraid",
  "Overwhelmed",
  "Numb",
  "Calm",
  "Hopeful",
  "Joyful",
  "Thankful"
]);
const validPastoralIntents = new Set([
  "assurance",
  "comfort",
  "rest",
  "wisdom",
  "courage",
  "renewal",
  "repentance",
  "gratitude",
  "perseverance",
  "prayer"
]);
const validSleepStates = new Set(["Poor", "Okay", "Good"]);
const validSocialMoods = new Set(["Isolated", "Withdrawn", "Sociable"]);
const validTones = new Set(["gentle", "steady", "reflective", "joyful", "corrective"]);

function validateArrayField(item, field, validValues, { max = 4, min = 1 } = {}) {
  if (!Array.isArray(item[field]) || item[field].length < min || item[field].length > max) {
    errors.push(`Record ${item.id} has invalid ${field}`);
    return;
  }

  item[field].forEach((value) => {
    if (!validValues.has(value)) {
      errors.push(`Record ${item.id} has unsupported ${field} value: ${value}`);
    }
  });
}

data.forEach((item, index) => {
  if (item.id !== index + 1) {
    errors.push(`Record ${index + 1} has non-sequential id ${item.id}`);
  }

  if (!item.encouragement_template?.startsWith("{name},")) {
    errors.push(`Record ${item.id} does not start with {name},`);
  }

  if (item.fallback_name !== "Christian") {
    errors.push(`Record ${item.id} has invalid fallback_name`);
  }

  if (!item.verse_text || !item.verse_reference || item.translation !== "KJV") {
    errors.push(`Record ${item.id} is missing verse data`);
  }

  if (!item.book || !Number.isInteger(item.chapter) || !Number.isInteger(item.verse)) {
    errors.push(`Record ${item.id} is missing parsed reference metadata`);
  }

  if (item.testament !== "Old Testament" && item.testament !== "New Testament") {
    errors.push(`Record ${item.id} has invalid testament`);
  }

  if (!Array.isArray(item.themes) || item.themes.length < 1) {
    errors.push(`Record ${item.id} is missing themes`);
  }

  validateArrayField(item, "moods", validMoods);
  validateArrayField(item, "socialMoods", validSocialMoods, { max: 2 });
  validateArrayField(item, "sleepStates", validSleepStates, { max: 2 });
  validateArrayField(item, "doctrinalEmphasis", validDoctrinalEmphasis, { max: 4 });

  if (!validPastoralIntents.has(item.pastoralIntent)) {
    errors.push(`Record ${item.id} has invalid pastoralIntent`);
  }

  if (!validTones.has(item.tone)) {
    errors.push(`Record ${item.id} has invalid tone`);
  }

  if (!validIntensities.has(item.intensity)) {
    errors.push(`Record ${item.id} has invalid intensity`);
  }

  if (!validLengthTiers.has(item.lengthTier)) {
    errors.push(`Record ${item.id} has invalid lengthTier`);
  }

  if (references.has(item.verse_reference)) {
    errors.push(`Duplicate verse reference: ${item.verse_reference}`);
  }

  references.add(item.verse_reference);
});

if (data.length !== 1000) {
  errors.push(`Expected 1000 records, found ${data.length}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${data.length} records with ${references.size} unique verses.`);
