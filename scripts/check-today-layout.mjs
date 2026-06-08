import fs from "node:fs";
import path from "node:path";

import data from "../src/data/encouragements.json" with { type: "json" };

const root = process.cwd();
const source = fs.readFileSync(path.join(root, "App.js"), "utf8");
const errors = [];
const TODAY_MESSAGE_MAX_CHARS = 360;
const TODAY_VERSE_MAX_CHARS = 190;

const devices = [
  { name: "iPhone 15", height: 852, width: 393, topInset: 47, bottomInset: 34 },
  { name: "iPhone 12 mini", height: 812, width: 390, topInset: 47, bottomInset: 34 },
  { name: "iPhone SE", height: 667, width: 375, topInset: 20, bottomInset: 0 }
];

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function renderTemplate(template, name = "Nelson", fallbackName = "Christian") {
  const displayName = name?.trim() || fallbackName;
  return template.replaceAll("{name}", displayName);
}

function getTodayScriptureTextPreset(pageHeight = 812) {
  if (pageHeight >= 900) {
    return { verseFontSize: 13, verseLineHeight: 18 };
  }

  if (pageHeight < 760) {
    return { verseFontSize: 11, verseLineHeight: 15 };
  }

  return { verseFontSize: 12, verseLineHeight: 17 };
}

function getTodayTextPreset(message, verseText, pageHeight = 812) {
  const messageLength = message.length;
  const verseLength = verseText.length;
  const scriptureTextPreset = getTodayScriptureTextPreset(pageHeight);

  if (pageHeight < 760) {
    if (messageLength > 320 || verseLength > 170) {
      return { messageFontSize: 11, messageLineHeight: 15, ...scriptureTextPreset };
    }

    if (messageLength > 280 || verseLength > 140) {
      return { messageFontSize: 12, messageLineHeight: 16, ...scriptureTextPreset };
    }

    if (messageLength > 220 || verseLength > 110) {
      return { messageFontSize: 13, messageLineHeight: 18, ...scriptureTextPreset };
    }

    return { messageFontSize: 15, messageLineHeight: 21, ...scriptureTextPreset };
  }

  if (pageHeight < 840) {
    if (messageLength > 320 || verseLength > 170) {
      return { messageFontSize: 13, messageLineHeight: 18, ...scriptureTextPreset };
    }

    if (messageLength > 280 || verseLength > 140) {
      return { messageFontSize: 14, messageLineHeight: 19, ...scriptureTextPreset };
    }

    if (messageLength > 220 || verseLength > 110) {
      return { messageFontSize: 15, messageLineHeight: 21, ...scriptureTextPreset };
    }

    return { messageFontSize: 18, messageLineHeight: 25, ...scriptureTextPreset };
  }

  if (messageLength > 335 || verseLength > 155) {
    return { messageFontSize: 16, messageLineHeight: 22, ...scriptureTextPreset };
  }

  if (messageLength > 300 || verseLength > 145) {
    return { messageFontSize: 17, messageLineHeight: 24, ...scriptureTextPreset };
  }

  if (messageLength > 280 || verseLength > 135) {
    return { messageFontSize: 16, messageLineHeight: 22, ...scriptureTextPreset };
  }

  if (messageLength > 220 || verseLength > 100) {
    return { messageFontSize: 18, messageLineHeight: 25, ...scriptureTextPreset };
  }

  return { messageFontSize: 22, messageLineHeight: 31, ...scriptureTextPreset };
}

function wrapLineCount(text, maxChars) {
  const words = text.trim().replace(/\s+/g, " ").split(" ");
  let lines = 1;
  let current = 0;

  for (const word of words) {
    const next = current ? current + 1 + word.length : word.length;

    if (next > maxChars && current) {
      lines += 1;
      current = word.length;
    } else {
      current = next;
    }
  }

  return lines;
}

function estimateTodayFit(item, device) {
  const message = renderTemplate(item.encouragement_template, "Nelson", item.fallback_name);
  const preset = getTodayTextPreset(message, item.verse_text, device.height);

  const horizontalPadding = 48;
  const articlePadding = 44;
  const articleInnerWidth = device.width - horizontalPadding - articlePadding;
  const pageVerticalPadding = device.topInset + 14 + device.bottomInset + 8;
  const fixedOutsideArticle = 64 + 12 + 8 + 68;
  const availableArticleHeight = device.height - pageVerticalPadding - fixedOutsideArticle;
  const headerHeight = 52 + 20;

  const verseCharsPerLine = Math.max(12, Math.floor((articleInnerWidth - 36) / (preset.verseFontSize * 0.53)));
  const verseLines = wrapLineCount(item.verse_text, verseCharsPerLine);
  const scriptureHeight = 32 + 15 + 10 + verseLines * preset.verseLineHeight + 12 + 20;

  const messageCharsPerLine = Math.max(10, Math.floor((articleInnerWidth * 0.98) / (preset.messageFontSize * 0.5)));
  const messageLines = wrapLineCount(message, messageCharsPerLine);
  const messageHeight = messageLines * preset.messageLineHeight + 32;
  const articleHeight = articlePadding + headerHeight + messageHeight + 18 + scriptureHeight;

  return {
    articleHeight,
    availableArticleHeight,
    message,
    messageHeight,
    messageLines,
    scriptureHeight,
    verseLines
  };
}

assert(source.includes("const TODAY_MESSAGE_MAX_CHARS = 360;"), "Today message limit must remain 360 characters");
assert(source.includes("const TODAY_VERSE_MAX_CHARS = 190;"), "Today verse limit must remain 190 characters");
assert(source.includes("function getTodayTextPreset(message, verseText, pageHeight = 812)"), "Today text preset must be page-height aware");
const todayArticleBlock = source.match(/todayArticle: \{[\s\S]*?\n  \},/);
assert(todayArticleBlock && todayArticleBlock[0].includes("flex: 1"), "Today article must fill the reading slot to avoid stranded whitespace");
assert(source.includes("todayReadingArea:") && source.includes("flex: 1"), "Today reading area must fill the available card slot");
assert(!source.includes("flex: 0"), "Fixed Today sections must not use flex: 0 because it collapses on React Native Web");
assert(!source.includes("todayHeroBlock"), "Today feed pages must not repeat the old hero section");
assert(!source.includes("numberOfLines={messageLines}") && !source.includes("numberOfLines={verseLines}"), "Today body and scripture must not use ellipsis line limits");

const todayFeedItems = data.filter((item) => {
  const message = renderTemplate(item.encouragement_template, "Nelson", item.fallback_name);
  return message.length <= TODAY_MESSAGE_MAX_CHARS && item.verse_text.length <= TODAY_VERSE_MAX_CHARS;
});

assert(todayFeedItems.length >= 850, `Today feed should keep a broad note pool, found ${todayFeedItems.length}`);

for (const device of devices) {
  const failures = [];

  for (const item of todayFeedItems) {
    const fit = estimateTodayFit(item, device);

    if (fit.articleHeight > fit.availableArticleHeight) {
      failures.push({
        articleHeight: fit.articleHeight,
        availableArticleHeight: fit.availableArticleHeight,
        id: item.id,
        messageLength: fit.message.length,
        reference: item.verse_reference,
        verseLength: item.verse_text.length
      });
    }
  }

  failures.sort((first, second) => {
    return second.articleHeight - second.availableArticleHeight - (first.articleHeight - first.availableArticleHeight);
  });

  assert(
    failures.length === 0,
    `${device.name} Today fit estimate found ${failures.length} clipping risks. Worst: ${JSON.stringify(failures[0])}`
  );
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Today layout checks passed for ${todayFeedItems.length} notes across ${devices.length} device profiles.`);
