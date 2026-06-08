import data from "../src/data/encouragements.json" with { type: "json" };

const errors = [];
const references = new Set();

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
