import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourceDir = path.join(root, "github-pages-site");
const outDir = path.join(root, "dist", "github-pages-site");
const requiredFiles = [
  ".nojekyll",
  "index.html",
  "privacy-policy.html",
  "support.html"
];

function copyFile(fileName) {
  const source = path.join(sourceDir, fileName);
  const destination = path.join(outDir, fileName);

  if (!fs.existsSync(source)) {
    throw new Error(`Missing ${source}`);
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

fs.rmSync(outDir, { force: true, recursive: true });
fs.mkdirSync(outDir, { recursive: true });

for (const fileName of requiredFiles) {
  copyFile(fileName);
}

const supportHtml = fs.readFileSync(path.join(outDir, "support.html"), "utf8");
const privacyHtml = fs.readFileSync(path.join(outDir, "privacy-policy.html"), "utf8");
const indexHtml = fs.readFileSync(path.join(outDir, "index.html"), "utf8");

function assertPage(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assertPage(indexHtml.includes("Daily Notes of Grace"), "Packaged landing page must have the expected app name");
assertPage(indexHtml.includes("Privacy Policy"), "Packaged landing page must link to privacy policy");
assertPage(indexHtml.includes("Support"), "Packaged landing page must link to support");

assertPage(supportHtml.includes("Daily Notes of Grace Support"), "Packaged support page must have the expected title");
assertPage(
  supportHtml.includes("You can update your name from Profile in the app menu"),
  "Packaged support page must match current app navigation language"
);
assertPage(!/ko-fi|donat|support this work/i.test(supportHtml), "Packaged support page contains donation language");
assertPage(!/https?:\/\//i.test(supportHtml), "Packaged support page should not include external URLs");

assertPage(privacyHtml.includes("Daily Notes of Grace Privacy Policy"), "Packaged privacy policy must have the expected title");
assertPage(
  privacyHtml.includes("Daily Notes of Grace does not use accounts, advertising, analytics, or tracking"),
  "Packaged privacy policy must match current no-tracking language"
);
assertPage(!privacyHtml.includes("<h2>External Links</h2>"), "Packaged privacy policy contains the removed External Links section");
assertPage(!/https?:\/\//i.test(privacyHtml), "Packaged privacy policy should not include external URLs");

console.log(`Packaged public pages for deployment at ${path.relative(root, outDir)}`);
