import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

function readText(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function hasNoTodoMarkers(text, label) {
  assert(!/\b(TODO|TBD|FIXME|placeholder)\b/i.test(text), `${label} contains TODO/TBD/FIXME/placeholder text`);
}

function isReverseDns(value) {
  return /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*){2,}$/.test(value);
}

function extractMetadataUrl(metadata, label) {
  const match = metadata.match(new RegExp(`${label}:\\n([^\\n]+)`, "i"));
  return match?.[1]?.trim();
}

function assertHttpsUrl(value, label) {
  assert(value, `${label} is missing`);

  if (!value) {
    return;
  }

  try {
    const url = new URL(value);
    assert(url.protocol === "https:", `${label} must use HTTPS`);
    assert(Boolean(url.hostname), `${label} must include a host`);
  } catch {
    assert(false, `${label} is not a valid URL`);
  }
}

const appJson = readJson("app.json");
const easJson = readJson("eas.json");
const app = appJson.expo;
const pkg = readJson("package.json");
const metadata = readText("app-store-metadata.md");
const reviewNotes = readText("app-store-review-notes.md");
const checklist = readText("app-store-checklist.md");
const readme = readText("README.md");
const qaChecklist = readText("testflight-qa-checklist.md");
const releaseRunbook = readText("release-runbook.md");
const privacyAnswers = readText("app-store-privacy-answers.md");
const ageRatingAnswers = readText("app-store-age-rating-answers.md");
const reviewHandoff = readText("review-handoff.md");

assert(app?.version === "1.0.0", "Initial App Store version should be 1.0.0");
assert(isReverseDns(app?.ios?.bundleIdentifier ?? ""), "iOS bundle identifier must be a valid reverse-DNS identifier");
assert(isReverseDns(app?.android?.package ?? ""), "Android package must be a valid reverse-DNS identifier");
assert(app.ios.bundleIdentifier === app.android.package, "iOS bundle identifier and Android package should match for this product");
assert(String(app?.ios?.buildNumber || "").length > 0, "iOS buildNumber is required");
assert(Number.isInteger(app?.android?.versionCode) && app.android.versionCode >= 1, "Android versionCode must be a positive integer");
assert(app?.scheme === "theweakchristian", "App scheme should be stable for future deep links");
assert(app?.extra?.eas?.projectId, "EAS projectId is required for cloud builds");

assert(easJson?.cli?.version, "eas.json must pin a minimum EAS CLI version");
assert(easJson?.cli?.appVersionSource === "remote", "EAS should use remote app version source with autoIncrement");
assert(easJson?.build?.preview?.distribution === "internal", "EAS preview profile should be internal distribution");
assert(easJson?.build?.production?.autoIncrement === true, "EAS production profile should auto-increment builds");
assert(Boolean(easJson?.submit?.production), "EAS submit production profile is required");

for (const screenshot of [
  "01-opening-wordmark.png",
  "02-home-dashboard.png",
  "03-todays-encouragement.png",
  "04-burger-menu.png",
  "05-reflect-and-pray.png"
]) {
  assert(fs.existsSync(path.join(root, "app-store-screenshots", screenshot)), `Missing App Store screenshot: ${screenshot}`);
}

assertHttpsUrl(extractMetadataUrl(metadata, "Privacy Policy URL"), "Privacy Policy URL");
assertHttpsUrl(extractMetadataUrl(metadata, "Support URL"), "Support URL");
assertHttpsUrl(extractMetadataUrl(metadata, "Marketing URL"), "Marketing URL");

for (const text of [metadata, reviewNotes]) {
  assert(text.includes("No account"), "Review materials must clearly state no account is required");
  assert(text.includes("no ads") || text.includes("ads, analytics"), "Review materials must mention no ads");
  assert(text.includes("no tracking") || text.includes("tracking"), "Review materials must mention tracking posture");
}

for (const command of [
  "npm run check:local",
  "npm run package:public-pages",
  "npm run create:screenshots",
  "npm test",
  "npm run check:flow",
  "npm run check:today",
  "npm run check:review",
  "npm run check:store",
  "npm run check:submit",
  "npm run check:ios",
  "npm run check:android"
]) {
  assert(reviewNotes.includes(command), `Review notes should list verification command: ${command}`);
}

assert(pkg.scripts?.["check:submit"] === "node scripts/check-submission-readiness.mjs", "package.json must expose check:submit");
assert(pkg.scripts?.["check:local"] === "node scripts/check-local-readiness.mjs", "package.json must expose check:local");
assert(pkg.scripts?.["check:release"] === "node scripts/check-release-readiness.mjs", "package.json must expose check:release");
assert(pkg.scripts?.["check:public"] === "node scripts/check-public-pages.mjs", "package.json must expose check:public");
assert(pkg.scripts?.["package:public-pages"] === "node scripts/package-public-pages.mjs", "package.json must expose package:public-pages");
assert(pkg.scripts?.["create:handoff"] === "node scripts/create-review-handoff.mjs", "package.json must expose create:handoff");
assert(fs.existsSync(path.join(root, "testflight-qa-checklist.md")), "TestFlight QA checklist is missing");
assert(fs.existsSync(path.join(root, "release-runbook.md")), "Release runbook is missing");
assert(fs.existsSync(path.join(root, "review-handoff.md")), "Review handoff is missing");
assert(fs.existsSync(path.join(root, "app-store-privacy-answers.md")), "App Store privacy answers are missing");
assert(fs.existsSync(path.join(root, "app-store-age-rating-answers.md")), "App Store age rating answers are missing");
assert(qaChecklist.includes("Today's Encouragement"), "TestFlight QA checklist must cover Today's Encouragement");
assert(qaChecklist.includes("No clipped devotional content"), "TestFlight QA checklist must include clipping acceptance criteria");
assert(qaChecklist.includes("npm run check:release"), "TestFlight QA checklist must require the release gate");
assert(readme.includes("908 notes"), "README must explain the 908-note layout-safe Today reader pool");
assert(reviewNotes.includes("908 notes"), "Review notes must explain the 908-note layout-safe Today reader pool");
assert(checklist.includes("908 layout-safe notes"), "App Store checklist must mention the 908-note Today reader pool");
assert(checklist.includes("npm run check:release"), "App Store checklist must mention check:release");
assert(checklist.includes("npm run check:public"), "App Store checklist must mention check:public");
assert(checklist.includes("stale as of 2026-05-30"), "App Store checklist must accurately flag stale hosted public pages");
assert(readme.includes("npm run check:release"), "README must document check:release");
assert(readme.includes("npm run check:local"), "README must document check:local");
assert(releaseRunbook.includes("npm run check:release"), "Release runbook must require check:release");
assert(releaseRunbook.includes("testflight-qa-checklist.md"), "Release runbook must reference TestFlight QA");
assert(releaseRunbook.includes("Data Not Collected"), "Release runbook must include App Privacy guidance");
assert(releaseRunbook.includes("app-store-privacy-answers.md"), "Release runbook must reference App Store privacy answers");
assert(releaseRunbook.includes("app-store-age-rating-answers.md"), "Release runbook must reference App Store age rating answers");
assert(reviewHandoff.includes("Latest local status: passing."), "Review handoff must summarize local status");
assert(reviewHandoff.includes("Current public status: failing because the hosted GitHub Pages site is stale."), "Review handoff must summarize public-page blocker");
assert(reviewHandoff.includes("npm run check:release"), "Review handoff must include the final release gate");
assert(reviewHandoff.includes("testflight-qa-checklist.md"), "Review handoff must reference TestFlight QA");
assert(privacyAnswers.includes("No, we do not collect data from this app."), "Privacy answers must specify no data collected");
assert(privacyAnswers.includes("No tracking"), "Privacy answers must specify no tracking");
assert(privacyAnswers.includes("Required-reason APIs"), "Privacy answers must mention required-reason APIs");
assert(ageRatingAnswers.includes("Unrestricted Web Access:\nNo"), "Age rating answers must specify no unrestricted web access");
assert(ageRatingAnswers.includes("User-Generated Content:\nNo"), "Age rating answers must specify no user-generated content");
assert(ageRatingAnswers.includes("Medical or Treatment Information:\nNone"), "Age rating answers must specify no medical or treatment information");
hasNoTodoMarkers(metadata, "App Store metadata");
hasNoTodoMarkers(reviewNotes, "App Store review notes");
hasNoTodoMarkers(checklist, "App Store checklist");
hasNoTodoMarkers(qaChecklist, "TestFlight QA checklist");
hasNoTodoMarkers(releaseRunbook, "Release runbook");
hasNoTodoMarkers(privacyAnswers, "App Store privacy answers");
hasNoTodoMarkers(ageRatingAnswers, "App Store age rating answers");
hasNoTodoMarkers(reviewHandoff, "Review handoff");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Submission readiness checks passed.");
