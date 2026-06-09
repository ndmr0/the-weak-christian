import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const sourceDir = path.join(root, "github-pages-site");
const outDir = path.join(root, "dist", "github-pages-site");
const patchDir = path.join(root, "dist", "github-pages-patch");
const patchPath = path.join(patchDir, "0001-Update-public-App-Store-pages.patch");
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

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    throw new Error(`${command} ${args.join(" ")} failed\n${output}`);
  }

  return result.stdout;
}

function tryGitShow(fileName) {
  const result = spawnSync("git", ["show", `github/main:${fileName}`], {
    cwd: root,
    encoding: "utf8"
  });

  if (result.status === 0) {
    return result.stdout;
  }

  return null;
}

function writeDeploymentPatch() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "twc-pages-patch-"));

  try {
    run("git", ["init"], tempDir);
    run("git", ["config", "user.email", "codex@openai.com"], tempDir);
    run("git", ["config", "user.name", "Codex"], tempDir);

    for (const fileName of requiredFiles) {
      const previous = tryGitShow(fileName);

      if (previous !== null) {
        fs.writeFileSync(path.join(tempDir, fileName), previous);
      }
    }

    run("git", ["add", "-A"], tempDir);
    run("git", ["commit", "-m", "Base public pages"], tempDir);

    for (const fileName of requiredFiles) {
      const source = path.join(outDir, fileName);
      const destination = path.join(tempDir, fileName);
      fs.copyFileSync(source, destination);
    }

    fs.mkdirSync(patchDir, { recursive: true });
    run("git", ["add", "-A"], tempDir);
    const diff = run("git", ["diff", "--cached", "--binary", "--", ...requiredFiles], tempDir);
    fs.writeFileSync(patchPath, diff);
  } finally {
    fs.rmSync(tempDir, { force: true, recursive: true });
  }
}

assertPage(indexHtml.includes("Daily Notes of Grace"), "Packaged landing page must have the expected app name");
assertPage(indexHtml.includes("Privacy Policy"), "Packaged landing page must link to privacy policy");
assertPage(indexHtml.includes("Support"), "Packaged landing page must link to support");

assertPage(supportHtml.includes("Daily Notes of Grace Support"), "Packaged support page must have the expected title");
assertPage(
  supportHtml.includes("turn the optional daily reminder on or off from Profile"),
  "Packaged support page must match current app navigation language"
);
assertPage(!/ko-fi|donat|support this work/i.test(supportHtml), "Packaged support page contains donation language");
assertPage(!/https?:\/\//i.test(supportHtml), "Packaged support page should not include external URLs");

assertPage(privacyHtml.includes("Daily Notes of Grace Privacy Policy"), "Packaged privacy policy must have the expected title");
assertPage(
  privacyHtml.includes("Daily Notes of Grace does not use accounts, advertising, analytics, or tracking"),
  "Packaged privacy policy must match current no-tracking language"
);
assertPage(
  privacyHtml.includes("optional daily reminder"),
  "Packaged privacy policy must describe optional local reminders"
);
assertPage(!privacyHtml.includes("<h2>External Links</h2>"), "Packaged privacy policy contains the removed External Links section");
assertPage(!/https?:\/\//i.test(privacyHtml), "Packaged privacy policy should not include external URLs");

writeDeploymentPatch();
console.log(`Packaged public pages for deployment at ${path.relative(root, outDir)}`);
console.log(`Wrote deployment patch at ${path.relative(root, patchPath)}`);
