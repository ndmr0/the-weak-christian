import fs from "node:fs";
import path from "node:path";

const projectRoot = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const jsonPath = path.join(projectRoot, "src/data/encouragements.json");
const jsonlPath = path.join(projectRoot, "encouragements_kjv_1000.jsonl");

const moodRules = [
  {
    keywords: ["discouraged", "despair", "delay", "delays", "endure", "hope", "promise", "standing", "weary"],
    label: "Discouraged",
    themes: ["Hope", "Perseverance", "Comfort", "Renewal"]
  },
  {
    keywords: ["burden", "carry", "rest", "strength", "tired", "uphold", "weak", "weakness", "weary"],
    label: "Tired",
    themes: ["Strength", "Comfort", "Peace", "Renewal"]
  },
  {
    keywords: ["anxious", "care", "fear", "panic", "peace", "troubled", "trust", "worry"],
    label: "Anxious",
    themes: ["Peace", "Faith", "God's Presence", "Guidance"]
  },
  {
    keywords: ["accompanied", "alone", "known", "lonely", "near", "nearness", "not alone", "presence", "with you"],
    label: "Lonely",
    themes: ["God's Presence", "Love", "Comfort", "Identity in Christ"]
  },
  {
    keywords: ["confused", "counsel", "guidance", "lead", "path", "teach", "teachable", "truth", "wisdom"],
    label: "Confused",
    themes: ["Wisdom", "Guidance", "Faith", "Prayer"]
  },
  {
    keywords: ["afraid", "fear", "protect", "refuge", "safe", "threat", "trembling"],
    label: "Afraid",
    themes: ["Peace", "God's Presence", "Strength", "Faith"]
  },
  {
    keywords: ["burden", "heavy", "help", "overwhelmed", "pressure", "sustain", "too much", "weight"],
    label: "Overwhelmed",
    themes: ["Comfort", "Strength", "Peace", "Prayer"]
  },
  {
    keywords: ["alive", "distant", "dry", "empty", "numb", "restore", "renew", "tired places"],
    label: "Numb",
    themes: ["Renewal", "God's Presence", "Grace", "Hope"]
  },
  {
    keywords: ["calm", "quiet", "rest", "settled", "still", "trust"],
    label: "Calm",
    themes: ["Peace", "Contentment", "Faith", "God's Presence"]
  },
  {
    keywords: ["future", "hope", "promise", "resurrection", "tomorrow"],
    label: "Hopeful",
    themes: ["Hope", "Perseverance", "Renewal", "Faith"]
  },
  {
    keywords: ["delight", "glad", "joy", "praise", "rejoice", "worship"],
    label: "Joyful",
    themes: ["Joy", "Contentment", "Love", "Grace"]
  },
  {
    keywords: ["gratitude", "praise", "thank", "thankful", "thanksgiving", "worship"],
    label: "Thankful",
    themes: ["Joy", "Prayer", "Grace", "Contentment"]
  }
];

const socialRules = [
  {
    keywords: ["alone", "lonely", "not alone", "presence", "with you", "accompanied", "known", "near"],
    label: "Isolated",
    moods: ["Lonely", "Afraid", "Numb"]
  },
  {
    keywords: ["dry", "empty", "quiet", "rest", "tired", "weary", "withdraw", "hidden", "burden"],
    label: "Withdrawn",
    moods: ["Tired", "Discouraged", "Overwhelmed", "Numb", "Anxious"]
  },
  {
    keywords: ["brother", "church", "encourage", "fellowship", "love", "serve", "service", "thank", "worship"],
    label: "Sociable",
    moods: ["Joyful", "Thankful", "Hopeful", "Calm"]
  }
];

const sleepRules = [
  {
    keywords: ["burden", "carry", "heavy", "noise", "rest", "sleep", "strength", "tired", "uphold", "weak", "weary"],
    label: "Poor",
    moods: ["Tired", "Overwhelmed", "Anxious", "Numb", "Discouraged"]
  },
  {
    keywords: ["daily", "ordinary", "peace", "step", "trust", "walk"],
    label: "Okay",
    moods: ["Calm", "Confused", "Lonely"]
  },
  {
    keywords: ["delight", "gratitude", "hope", "joy", "praise", "serve", "thank", "worship"],
    label: "Good",
    moods: ["Hopeful", "Joyful", "Thankful", "Calm"]
  }
];

const pastoralIntentRules = [
  ["assurance", ["accepted", "assurance", "belong", "kept", "known", "loved", "safe", "secure"]],
  ["comfort", ["comfort", "compassion", "gentle", "mercy", "near", "presence", "weary"]],
  ["rest", ["burden", "carry", "peace", "quiet", "rest", "sleep", "tired"]],
  ["wisdom", ["counsel", "guidance", "instruction", "path", "teach", "truth", "wisdom"]],
  ["courage", ["afraid", "courage", "fear", "refuge", "stand", "strength"]],
  ["renewal", ["alive", "new", "renew", "restore", "rise", "wounded"]],
  ["repentance", ["cleanse", "forgive", "forgiveness", "repent", "return", "sin"]],
  ["gratitude", ["gratitude", "praise", "rejoice", "thank", "thankful", "thanksgiving", "worship"]],
  ["perseverance", ["endure", "faithful step", "keep walking", "persevere", "standing", "waiting"]],
  ["prayer", ["ask", "call upon", "cry", "pray", "prayer", "seek"]]
];

const doctrineRules = [
  ["Christ's sufficiency", ["Christ is sufficient", "Jesus is sufficient", "Saviour", "Savior", "Lord Jesus", "Christ"]],
  ["grace", ["grace", "mercy", "kindness", "compassion"]],
  ["forgiveness", ["cleanse", "forgive", "forgiveness", "repent", "sin"]],
  ["finished work", ["cross", "finished work", "not by your performance", "redeemer", "redemption", "saved"]],
  ["perseverance", ["endure", "faithful", "keep", "kept", "perseverance", "promise", "stand", "uphold"]],
  ["providence", ["care", "direct", "guide", "knows", "provide", "provision", "sustain"]],
  ["God's presence", ["accompanied", "near", "nearness", "not alone", "presence", "with you"]],
  ["union with Christ", ["accepted in Christ", "belong", "identity", "in Christ", "known", "loved"]],
  ["Scripture wisdom", ["counsel", "instruction", "truth", "word", "wisdom"]],
  ["resurrection hope", ["risen", "resurrection", "rose again", "tomorrow", "future", "hope"]]
];

const toneRules = [
  ["gentle", ["gentle", "mercy", "compassion", "weary", "tired", "rest", "near"]],
  ["steady", ["faithful", "promise", "trust", "stand", "held", "kept", "step"]],
  ["reflective", ["wisdom", "truth", "teach", "consider", "learn", "heart"]],
  ["joyful", ["joy", "praise", "rejoice", "thank", "worship", "delight"]],
  ["corrective", ["repent", "sin", "forgive", "obedience", "truth", "instruction"]]
];

function normalizeText(item) {
  return [
    item.encouragement_template,
    item.verse_text,
    item.verse_reference,
    ...(Array.isArray(item.themes) ? item.themes : [])
  ].join(" ").toLowerCase();
}

function scoreByRule(text, themes, rule) {
  let score = 0;

  for (const theme of rule.themes ?? []) {
    if (themes.includes(theme)) {
      score += 5;
    }
  }

  for (const keyword of rule.keywords ?? []) {
    if (text.includes(keyword.toLowerCase())) {
      score += 3;
    }
  }

  return score;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function topLabels(scored, minimumScore, limit) {
  return scored
    .filter((entry) => entry.score >= minimumScore)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, limit)
    .map((entry) => entry.label);
}

function inferMoods(item, text) {
  const themes = Array.isArray(item.themes) ? item.themes : [];
  const scored = moodRules.map((rule) => ({
    label: rule.label,
    score: scoreByRule(text, themes, rule)
  }));
  const best = Math.max(...scored.map((entry) => entry.score), 0);
  const labels = topLabels(scored, Math.max(5, best - 5), 4);
  const extras = [];

  if (
    !labels.includes("Overwhelmed") &&
    (
      text.includes("burden") ||
      text.includes("heavy") ||
      text.includes("pressure") ||
      text.includes("weight") ||
      (themes.includes("Strength") && text.includes("weak")) ||
      (themes.includes("Prayer") && text.includes("help"))
    )
  ) {
    extras.push("Overwhelmed");
  }

  if (
    !labels.includes("Thankful") &&
    (
      text.includes("thank") ||
      text.includes("thanksgiving") ||
      text.includes("gratitude") ||
      text.includes("praise") ||
      (themes.includes("Joy") && themes.includes("Grace")) ||
      (themes.includes("Joy") && themes.includes("Prayer"))
    )
  ) {
    extras.push("Thankful");
  }

  if (labels.length > 0) {
    return unique([...labels, ...extras]).slice(0, 4);
  }

  if (themes.includes("Faith")) {
    return ["Anxious", "Hopeful"];
  }

  if (themes.includes("Grace")) {
    return ["Discouraged", "Numb"];
  }

  return ["Discouraged"];
}

function inferSocialMoods(text, moods) {
  const moodSet = new Set(moods);
  const scored = socialRules.map((rule) => {
    const keywordScore = rule.keywords.reduce(
      (total, keyword) => total + (text.includes(keyword.toLowerCase()) ? 3 : 0),
      0
    );
    const moodScore = rule.moods.reduce((total, mood) => total + (moodSet.has(mood) ? 2 : 0), 0);
    return {
      label: rule.label,
      score: keywordScore + moodScore
    };
  });
  const best = Math.max(...scored.map((entry) => entry.score), 0);
  const labels = topLabels(scored, Math.max(2, best - 2), 2);

  return labels.length > 0 ? labels : ["Withdrawn"];
}

function inferSleepStates(text, moods) {
  const moodSet = new Set(moods);
  const scored = sleepRules.map((rule) => {
    const keywordScore = rule.keywords.reduce(
      (total, keyword) => total + (text.includes(keyword.toLowerCase()) ? 3 : 0),
      0
    );
    const moodScore = rule.moods.reduce((total, mood) => total + (moodSet.has(mood) ? 2 : 0), 0);
    return {
      label: rule.label,
      score: keywordScore + moodScore
    };
  });
  const best = Math.max(...scored.map((entry) => entry.score), 0);
  const labels = topLabels(scored, Math.max(2, best - 2), 2);

  return labels.length > 0 ? labels : ["Okay"];
}

function inferPastoralIntent(text) {
  const scored = pastoralIntentRules.map(([label, keywords]) => ({
    label,
    score: keywords.reduce((total, keyword) => total + (text.includes(keyword.toLowerCase()) ? 1 : 0), 0)
  }));
  const best = scored.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))[0];
  return best?.score > 0 ? best.label : "comfort";
}

function inferDoctrinalEmphasis(text, themes) {
  const scored = doctrineRules.map(([label, keywords]) => ({
    label,
    score: keywords.reduce((total, keyword) => total + (text.includes(keyword.toLowerCase()) ? 1 : 0), 0)
  }));
  const labels = scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
    .slice(0, 4)
    .map((entry) => entry.label);

  if (themes.includes("Salvation") && !labels.includes("finished work")) {
    labels.push("finished work");
  }

  if (themes.includes("Grace") && !labels.includes("grace")) {
    labels.push("grace");
  }

  if (themes.includes("Faith") && !labels.includes("perseverance")) {
    labels.push("perseverance");
  }

  return unique(labels).slice(0, 4);
}

function inferTone(text, moods) {
  const scored = toneRules.map(([label, keywords]) => ({
    label,
    score: keywords.reduce((total, keyword) => total + (text.includes(keyword.toLowerCase()) ? 1 : 0), 0)
  }));
  const best = scored.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))[0];

  if (best?.score > 0) {
    return best.label;
  }

  if (moods.some((mood) => ["Tired", "Anxious", "Lonely", "Numb", "Overwhelmed"].includes(mood))) {
    return "gentle";
  }

  return "steady";
}

function inferIntensity(moods, sleepStates, text) {
  if (
    moods.some((mood) => ["Overwhelmed", "Afraid", "Anxious", "Numb"].includes(mood)) ||
    text.includes("despair") ||
    text.includes("heavy")
  ) {
    return "high-need";
  }

  if (sleepStates.includes("Poor") || moods.some((mood) => ["Tired", "Discouraged", "Lonely"].includes(mood))) {
    return "low-energy";
  }

  return "steady";
}

function inferLengthTier(item) {
  const messageLength = item.encouragement_template.replaceAll("{name}", "Christian").length;
  const verseLength = item.verse_text.length;

  if (messageLength > 360 || verseLength > 190) {
    return "long";
  }

  if (messageLength <= 270 && verseLength <= 130) {
    return "short";
  }

  return "screen-safe";
}

const records = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

const enriched = records.map((item) => {
  const text = normalizeText(item);
  const themes = Array.isArray(item.themes) ? item.themes : [];
  const moods = inferMoods(item, text);
  const socialMoods = inferSocialMoods(text, moods);
  const sleepStates = inferSleepStates(text, moods);
  const doctrinalEmphasis = inferDoctrinalEmphasis(text, themes);

  return {
    ...item,
    moods,
    socialMoods,
    sleepStates,
    pastoralIntent: inferPastoralIntent(text),
    doctrinalEmphasis: doctrinalEmphasis.length > 0 ? doctrinalEmphasis : ["Christ's sufficiency"],
    tone: inferTone(text, moods),
    intensity: inferIntensity(moods, sleepStates, text),
    lengthTier: inferLengthTier(item)
  };
});

fs.writeFileSync(jsonPath, `${JSON.stringify(enriched, null, 2)}\n`);
fs.writeFileSync(jsonlPath, `${enriched.map((item) => JSON.stringify(item)).join("\n")}\n`);

const countBy = (key) => {
  const counts = new Map();
  for (const item of enriched) {
    for (const value of Array.isArray(item[key]) ? item[key] : [item[key]]) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
};

console.log(`Mapped ${enriched.length} encouragement records.`);
console.log("Moods:");
console.log(countBy("moods").map(([label, count]) => `${label}: ${count}`).join("\n"));
console.log("Social moods:");
console.log(countBy("socialMoods").map(([label, count]) => `${label}: ${count}`).join("\n"));
console.log("Sleep states:");
console.log(countBy("sleepStates").map(([label, count]) => `${label}: ${count}`).join("\n"));
