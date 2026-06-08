import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];
const expectedScreenshots = [
  "01-opening-wordmark.png",
  "02-home-dashboard.png",
  "03-todays-encouragement.png",
  "04-burger-menu.png",
  "05-reflect-and-pray.png"
];
const expectedScreenshotSet = new Set(expectedScreenshots);

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function getPngSize(filePath) {
  const buffer = fs.readFileSync(path.join(root, filePath));
  const isPng = buffer.toString("ascii", 1, 4) === "PNG";

  if (!isPng) {
    return null;
  }

  return {
    height: buffer.readUInt32BE(20),
    width: buffer.readUInt32BE(16)
  };
}

for (const screenshot of expectedScreenshots) {
  const filePath = `app-store-screenshots/${screenshot}`;
  assert(fs.existsSync(path.join(root, filePath)), `${filePath} is missing`);

  if (fs.existsSync(path.join(root, filePath))) {
    const size = getPngSize(filePath);
    assert(size?.width === 1242 && size?.height === 2688, `${filePath} must be 1242x2688`);
  }
}

const screenshotDir = path.join(root, "app-store-screenshots");
if (fs.existsSync(screenshotDir)) {
  for (const fileName of fs.readdirSync(screenshotDir)) {
    if (fileName.startsWith(".")) {
      continue;
    }

    assert(
      expectedScreenshotSet.has(fileName),
      `Unexpected App Store screenshot artifact: app-store-screenshots/${fileName}`
    );
  }
}

for (const docPath of ["app-store-metadata.md", "app-store-review-notes.md", "app-store-checklist.md"]) {
  assert(fs.existsSync(path.join(root, docPath)), `${docPath} is missing`);
}

const metadata = fs.readFileSync(path.join(root, "app-store-metadata.md"), "utf8");
assert(metadata.includes("Journal reflections"), "App Store metadata must mention journal reflections");
assert(metadata.includes("Prayer requests"), "App Store metadata must mention prayer requests");
assert(metadata.includes("Recently Seen"), "App Store metadata must mention Recently Seen");
assert(!metadata.includes("Infinite, screen-by-screen"), "App Store metadata should not describe the old infinite feed");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Review asset checks passed.");
