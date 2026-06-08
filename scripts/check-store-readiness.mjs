import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), "utf8"));
}

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

function assertNoExternalLinks(filePath) {
  const html = fs.readFileSync(path.join(root, filePath), "utf8");
  assert(!/https?:\/\//i.test(html), `${filePath} contains an external URL`);
}

const appJson = readJson("app.json");
const app = appJson.expo;
const pkg = readJson("package.json");

assert(app?.name === "Daily Notes of Grace", "app.json expo.name must be Daily Notes of Grace");
assert(app?.slug === "the-weak-christian", "app.json expo.slug must be the-weak-christian");
assert(app?.orientation === "portrait", "app.json orientation should remain portrait");
assert(app?.userInterfaceStyle === "light", "app.json userInterfaceStyle should remain light");
assert(app?.ios?.bundleIdentifier, "app.json must define ios.bundleIdentifier");
assert(app?.ios?.infoPlist?.ITSAppUsesNonExemptEncryption === false, "iOS encryption declaration must be false");
assert(app?.ios?.privacyManifests?.NSPrivacyTracking === false, "iOS privacy manifest must declare tracking false");
assert(Array.isArray(app?.ios?.privacyManifests?.NSPrivacyTrackingDomains), "iOS privacy manifest must declare tracking domains");
assert(app.ios.privacyManifests.NSPrivacyTrackingDomains.length === 0, "iOS privacy manifest tracking domains must be empty");
assert(Array.isArray(app?.ios?.privacyManifests?.NSPrivacyCollectedDataTypes), "iOS privacy manifest must declare collected data types");
assert(app.ios.privacyManifests.NSPrivacyCollectedDataTypes.length === 0, "iOS privacy manifest collected data types must be empty");
assert(
  Array.isArray(app?.ios?.privacyManifests?.NSPrivacyAccessedAPITypes) &&
    app.ios.privacyManifests.NSPrivacyAccessedAPITypes.length >= 4,
  "iOS privacy manifest must declare required-reason APIs"
);
assert(app?.android?.package, "app.json must define android.package");

for (const asset of ["assets/icon.png", "assets/adaptive-icon.png"]) {
  const size = getPngSize(asset);
  assert(size?.width === 1024 && size?.height === 1024, `${asset} must be a 1024x1024 PNG`);
}

assert(pkg.dependencies?.expo === "~54.0.35", "package.json must use expo ~54.0.35");
assert(!pkg.devDependencies?.["eas-cli"], "Do not pin eas-cli locally; use a current external EAS CLI for submission");

for (const filePath of [
  "privacy-policy.html",
  "support.html",
  "github-pages-site/privacy-policy.html",
  "github-pages-site/support.html"
]) {
  assert(fs.existsSync(path.join(root, filePath)), `${filePath} is missing`);
  assertNoExternalLinks(filePath);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Store readiness checks passed.");
