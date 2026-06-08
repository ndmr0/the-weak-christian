import fs from "node:fs";
import path from "node:path";

const appPath = path.join(process.cwd(), "App.js");
const source = fs.readFileSync(appPath, "utf8");
const errors = [];

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

const menuRoutes = [...source.matchAll(/onNavigate\("([^"]+)"\)/g)].map((match) => match[1]);
const handledScreens = new Set([...source.matchAll(/screen === "([^"]+)"/g)].map((match) => match[1]));
const lines = source.split("\n");

for (const route of new Set(menuRoutes)) {
  assert(handledScreens.has(route), `Menu route "${route}" does not have a matching screen handler`);
}

assert(
  source.includes('["encouragement", "explore", "home", "recent", "saved", "today"].includes(screen)'),
  "Share return-screen whitelist must include encouragement and recent"
);
assert(
  source.includes("const seenIdOrder = [...safeSeenIds]") &&
    source.includes("viewedAt: safeSeenHistory[id] ?? null") &&
    source.includes("return second.legacyIndex - first.legacyIndex"),
  "Recently Seen must preserve seen-history order and prefer stored timestamps"
);
assert(
  !source.includes('numberOfLines={messageLines}') && !source.includes('numberOfLines={verseLines}'),
  "Today message and scripture text must not use old truncation line limits"
);
assert(source.includes("function showStorageError"), "App must show a friendly error when local storage writes fail");
assert(
  source.includes("const didSave = await onSaveEntry") && source.includes("const didSave = await onSaveRequest"),
  "Journal and prayer editors must wait for confirmed saves before navigating away"
);
assert(
  source.includes("const didDelete = await onDeleteEntry") && source.includes("const didDelete = await onDeleteRequest"),
  "Journal and prayer editors must wait for confirmed deletes before navigating away"
);
assert(
  source.includes("const didRemove = await onToggleSaved"),
  "Saved-detail removal must wait for confirmed persistence before navigating away"
);

for (const label of [
  "Your name",
  "Explore search",
  "Reflection title",
  "Reflection body",
  "Search encouragements to link",
  "Search reflections",
  "Prayer title",
  "Prayer body",
  "Search prayer requests",
  "Personal saved note",
  "Search saved notes",
  "Profile name",
  "Share recipient name"
]) {
  assert(source.includes(`accessibilityLabel="${label}"`), `Missing accessibility label: ${label}`);
}

for (let index = 0; index < lines.length; index += 1) {
  if (!lines[index].includes("<Pressable")) {
    continue;
  }

  const block = lines.slice(index, Math.min(lines.length, index + 14)).join("\n");

  if (block.includes('accessibilityRole="button"')) {
    assert(
      block.includes("accessibilityLabel="),
      `Pressable button near App.js:${index + 1} must define accessibilityLabel`
    );
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("App flow checks passed.");
