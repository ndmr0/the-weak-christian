import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const OUT_DIR = "app-store-screenshots";
const WIDTH = 1242;
const HEIGHT = 2688;
const encouragements = JSON.parse(fs.readFileSync("src/data/encouragements.json", "utf8"));
const require = createRequire(import.meta.url);

function loadSharp() {
  try {
    return require("sharp");
  } catch {
    return require(
      path.join(
        os.homedir(),
        ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp"
      )
    );
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getMessage(item, name = "Christian") {
  return item.encouragement_template.replace("{name}", name);
}

function wrapWords(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;

    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) {
    lines.push(current);
  }

  return lines;
}

function multilineText(lines, x, y, size, lineHeight, options = {}) {
  const weight = options.weight ?? 400;
  const family = options.family ?? "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif";
  const style = options.style ? `font-style="${options.style}"` : "";
  const fill = options.fill ?? "#050505";

  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" ${style}>
${lines
  .map((line, index) => `  <tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeHtml(line)}</tspan>`)
  .join("\n")}
</text>`;
}

function shell(title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#ffffff"/>
  ${title ? `<text x="94" y="210" fill="#050505" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="47" font-weight="900"><tspan x="94">The</tspan><tspan x="94" dy="45">Weak</tspan><tspan x="94" dy="45">Christian</tspan></text>` : ""}
  ${body}
</svg>`;
}

async function saveScreenshot(name, svg) {
  const sharp = loadSharp();
  const svgPath = path.join(OUT_DIR, `${name}.svg`);
  const pngPath = path.join(OUT_DIR, `${name}.png`);

  fs.writeFileSync(svgPath, svg);
  await sharp(Buffer.from(svg)).png().toFile(pngPath);
}

async function createSplash() {
  await saveScreenshot(
    "01-opening-wordmark",
    shell(
      false,
      `<text x="122" y="1120" fill="#050505" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="178" font-weight="900">
  <tspan x="122">The</tspan>
  <tspan x="122" dy="158">Weak</tspan>
  <tspan x="122" dy="158">Christian</tspan>
</text>`
    )
  );
}

async function createNameScreen() {
  await saveScreenshot(
    "02-name-personalization",
    shell(
      false,
      `<text x="122" y="1040" fill="#050505" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="148" font-weight="900">
  <tspan x="122">What&apos;s</tspan>
  <tspan x="122" dy="132">your</tspan>
  <tspan x="122" dy="132">name?</tspan>
</text>
<rect x="122" y="1458" width="760" height="96" rx="18" fill="#dedcf4"/>
<text x="158" y="1524" fill="#8d899b" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="43" font-style="italic" letter-spacing="5">Your Name</text>
<text x="324" y="1848" fill="#050505" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="38" font-style="italic">Continue Without a Name</text>
<circle cx="621" cy="2056" r="72" fill="#e9e6ff" stroke="#d8d4ff" stroke-width="10"/>
<text x="589" y="2080" fill="#5147e8" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="68">→</text>`
    )
  );
}

async function createFeed() {
  const item = encouragements.find((entry) => entry.verse_reference === "John 3:16") ?? encouragements[0];
  const message = getMessage(item);
  const messageLines = wrapWords(message, 30);
  const verseLines = wrapWords(`"${item.verse_text}" ${item.verse_reference}, KJV`, 52);

  await saveScreenshot(
    "03-encouragement-feed",
    shell(
      true,
      `${multilineText(messageLines, 94, 560, 64, 67)}
<rect x="94" y="${650 + messageLines.length * 67}" width="132" height="7" fill="#050505"/>
${multilineText(verseLines, 94, 730 + messageLines.length * 67, 38, 48, {
  family: "Georgia, 'Times New Roman', serif",
  style: "italic"
})}
<rect x="642" y="2410" width="228" height="92" rx="46" fill="#050505"/>
<text x="688" y="2470" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="38" font-weight="700">♥ Save</text>
<rect x="900" y="2410" width="236" height="92" rx="46" fill="#050505"/>
<text x="948" y="2470" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="38" font-weight="700">↗ Share</text>`
    )
  );
}

async function createSaved() {
  const first = encouragements[4];
  const second = encouragements[8];

  await saveScreenshot(
    "04-saved-notes",
    shell(
      false,
      `<text x="72" y="124" fill="#050505" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="72">←</text>
<text x="150" y="116" fill="#050505" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="62" font-weight="900">Saved</text>
${multilineText(wrapWords(getMessage(first, "Nelson"), 45), 94, 390, 54, 58)}
<rect x="94" y="690" width="132" height="7" fill="#050505"/>
${multilineText(wrapWords(`"${first.verse_text}" ${first.verse_reference}, KJV`, 60), 94, 760, 35, 43, {
  family: "Georgia, 'Times New Roman', serif",
  style: "italic"
})}
<line x1="94" y1="1045" x2="1148" y2="1045" stroke="#d8d8d8" stroke-width="3"/>
${multilineText(wrapWords(getMessage(second, "Nelson"), 45), 94, 1225, 54, 58)}
<rect x="94" y="1525" width="132" height="7" fill="#050505"/>
${multilineText(wrapWords(`"${second.verse_text}" ${second.verse_reference}, KJV`, 60), 94, 1595, 35, 43, {
  family: "Georgia, 'Times New Roman', serif",
  style: "italic"
})}`
    )
  );
}

async function createShare() {
  const item = encouragements[0];
  const message = `${getMessage(item, "Maria")}\n\n"${item.verse_text}"\n${item.verse_reference}, KJV\n\nShared from The Weak Christian`;

  await saveScreenshot(
    "05-share-preview",
    shell(
      false,
      `<text x="72" y="124" fill="#050505" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="72">←</text>
<text x="150" y="116" fill="#050505" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="62" font-weight="900">Share</text>
<text x="94" y="450" fill="#050505" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="118" font-weight="900">
  <tspan x="94">Who&apos;s this</tspan>
  <tspan x="94" dy="106">for?</tspan>
</text>
<rect x="94" y="710" width="760" height="96" rx="18" fill="#dedcf4"/>
<text x="130" y="776" fill="#050505" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="43" font-style="italic" letter-spacing="4">Maria</text>
<text x="94" y="950" fill="#050505" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="38" font-style="italic">Preview</text>
<rect x="94" y="1000" width="1054" height="965" rx="20" fill="#ffffff" stroke="#050505" stroke-width="5"/>
${multilineText(
  message
    .split("\n")
    .flatMap((line) => (line ? wrapWords(line, 48) : [""])),
  140,
  1100,
  38,
  46
)}
<rect x="912" y="2135" width="236" height="92" rx="46" fill="#050505"/>
<text x="960" y="2195" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-size="38" font-weight="700">Share</text>`
    )
  );
}

fs.mkdirSync(OUT_DIR, { recursive: true });
await createSplash();
await createNameScreen();
await createFeed();
await createSaved();
await createShare();

console.log(`Wrote App Store screenshot PNGs and SVG sources to ${OUT_DIR}`);
