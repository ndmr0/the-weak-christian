import fs from "node:fs";
import path from "node:path";

const projectRoot = process.argv[2];

if (!projectRoot) {
  console.error("Usage: node enrich-twc-data.mjs /path/to/TWC");
  process.exit(1);
}

const jsonlPath = path.join(projectRoot, "encouragements_kjv_1000.jsonl");
const jsonPath = path.join(projectRoot, "src/data/encouragements.json");
const validatePath = path.join(projectRoot, "scripts/validate-data.mjs");

const oldTestament = new Set([
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
  "Joshua",
  "Judges",
  "Ruth",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "1 Chronicles",
  "2 Chronicles",
  "Ezra",
  "Nehemiah",
  "Esther",
  "Job",
  "Psalms",
  "Proverbs",
  "Ecclesiastes",
  "Song of Solomon",
  "Isaiah",
  "Jeremiah",
  "Lamentations",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Zephaniah",
  "Haggai",
  "Zechariah",
  "Malachi"
]);

const themeRules = [
  ["Peace", ["peace", "anxious", "anxiety", "worry", "worried", "fear", "afraid", "troubled", "storm", "quiet"]],
  ["Strength", ["strength", "strong", "weary", "weak", "weakness", "uphold", "carry", "burden", "endure", "endurance"]],
  ["Grace", ["grace", "mercy", "kindness", "compassion", "gentle", "humbled", "forgives", "forgiveness"]],
  ["Faith", ["faith", "trust", "believe", "belief", "confidence", "promise", "promises", "faithful"]],
  ["Hope", ["hope", "tomorrow", "future", "despair", "waiting", "wait", "delays", "eternal"]],
  ["Prayer", ["prayer", "pray", "call upon", "seek", "come to him", "bring him", "ask"]],
  ["Wisdom", ["wisdom", "wise", "truth", "understanding", "instruction", "counsel", "teach", "teachable", "path"]],
  ["God's Presence", ["presence", "near", "nearness", "with you", "not alone", "walks with you", "accompanied"]],
  ["Love", ["love", "loved", "affection", "heart on his people", "saving love"]],
  ["Joy", ["joy", "rejoice", "praise", "thanksgiving", "gratitude", "delight"]],
  ["Salvation", ["salvation", "saviour", "savior", "redeemer", "cross", "saves", "gospel", "everlasting life"]],
  ["Identity in Christ", ["identity", "accepted", "worth", "known", "new name", "brought near", "in christ"]],
  ["Provision", ["provide", "provision", "need", "shepherd", "sustain", "daily bread"]],
  ["Guidance", ["guide", "guidance", "lead", "direct", "lamp", "way", "steps"]],
  ["Renewal", ["renew", "new", "rise", "restore", "formed", "work within you"]],
  ["Perseverance", ["perseverance", "keep walking", "stand firm", "labor", "race", "finish"]]
];

const fallbackByBook = new Map([
  ["Psalms", ["Prayer", "Peace", "God's Presence"]],
  ["Proverbs", ["Wisdom", "Guidance"]],
  ["Isaiah", ["Hope", "Comfort", "God's Presence"]],
  ["John", ["Salvation", "Love", "Faith"]],
  ["Romans", ["Grace", "Faith", "Salvation"]],
  ["1 Corinthians", ["Love", "Strength"]],
  ["2 Corinthians", ["Comfort", "Strength", "Hope"]],
  ["Galatians", ["Grace", "Freedom"]],
  ["Ephesians", ["Grace", "Identity in Christ"]],
  ["Philippians", ["Joy", "Peace", "Contentment"]],
  ["Hebrews", ["Faith", "Perseverance"]],
  ["James", ["Wisdom", "Prayer"]],
  ["1 Peter", ["Hope", "Perseverance"]],
  ["1 John", ["Love", "Assurance"]]
]);

function parseReference(reference) {
  const match = reference.match(/^(.+?)\s+(\d+):(\d+)(?:[-–](\d+))?$/);

  if (!match) {
    return {
      book: reference,
      chapter: null,
      verse: null,
      testament: "Unknown"
    };
  }

  const book = match[1];
  const chapter = Number(match[2]);
  const verse = Number(match[3]);

  return {
    book,
    chapter,
    verse,
    testament: oldTestament.has(book) ? "Old Testament" : "New Testament"
  };
}

function inferThemes(item, book) {
  const haystack = `${item.encouragement_template} ${item.verse_text} ${item.verse_reference}`.toLowerCase();
  const scored = [];

  for (const [theme, terms] of themeRules) {
    const score = terms.reduce((total, term) => total + (haystack.includes(term.toLowerCase()) ? 1 : 0), 0);

    if (score > 0) {
      scored.push({ theme, score });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.theme.localeCompare(b.theme));

  const themes = scored.map((entry) => entry.theme);
  const fallbackThemes = fallbackByBook.get(book) ?? ["Encouragement"];

  for (const theme of fallbackThemes) {
    if (!themes.includes(theme)) {
      themes.push(theme);
    }
  }

  return themes.slice(0, 4);
}

const lines = fs.readFileSync(jsonlPath, "utf8").trim().split("\n");
const records = lines.map((line) => JSON.parse(line));

const enriched = records.map((item) => {
  const reference = parseReference(item.verse_reference);
  const themes = inferThemes(item, reference.book);

  return {
    id: item.id,
    encouragement_template: item.encouragement_template,
    fallback_name: item.fallback_name,
    verse_text: item.verse_text,
    verse_reference: item.verse_reference,
    translation: item.translation,
    book: reference.book,
    chapter: reference.chapter,
    verse: reference.verse,
    testament: reference.testament,
    themes
  };
});

fs.writeFileSync(jsonlPath, `${enriched.map((item) => JSON.stringify(item)).join("\n")}\n`);
fs.writeFileSync(jsonPath, `${JSON.stringify(enriched, null, 2)}\n`);

const validateSource = fs.readFileSync(validatePath, "utf8");
const updatedValidateSource = validateSource
  .replace(
    `  if (!item.verse_text || !item.verse_reference || item.translation !== "KJV") {
    errors.push(\`Record \${item.id} is missing verse data\`);
  }`,
    `  if (!item.verse_text || !item.verse_reference || item.translation !== "KJV") {
    errors.push(\`Record \${item.id} is missing verse data\`);
  }

  if (!item.book || !Number.isInteger(item.chapter) || !Number.isInteger(item.verse)) {
    errors.push(\`Record \${item.id} is missing parsed reference metadata\`);
  }

  if (item.testament !== "Old Testament" && item.testament !== "New Testament") {
    errors.push(\`Record \${item.id} has invalid testament\`);
  }

  if (!Array.isArray(item.themes) || item.themes.length < 1) {
    errors.push(\`Record \${item.id} is missing themes\`);
  }`
  );

if (updatedValidateSource === validateSource) {
  console.warn("Validation script was already updated or did not match the expected block.");
} else {
  fs.writeFileSync(validatePath, updatedValidateSource);
}

const themeCounts = new Map();
for (const item of enriched) {
  for (const theme of item.themes) {
    themeCounts.set(theme, (themeCounts.get(theme) ?? 0) + 1);
  }
}

console.log(`Enriched ${enriched.length} records.`);
console.log([...themeCounts.entries()].sort((a, b) => b[1] - a[1]).map(([theme, count]) => `${theme}: ${count}`).join("\n"));
