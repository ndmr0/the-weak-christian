import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const patchPath = path.join(root, "dist", "github-pages-patch", "0001-Update-public-App-Store-pages.patch");
const repoUrl = "https://github.com/ndmr0/the-weak-christian.git";
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "twc-pages-patch-check-"));

function run(command, args, cwd = tempDir) {
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

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(fs.existsSync(patchPath), "GitHub Pages patch is missing");

run("git", ["clone", "--depth", "1", repoUrl, tempDir], root);
run("git", ["apply", "--check", patchPath]);
run("git", ["apply", patchPath]);

const privacyHtml = fs.readFileSync(path.join(tempDir, "privacy-policy.html"), "utf8");
const supportHtml = fs.readFileSync(path.join(tempDir, "support.html"), "utf8");

assert(fs.existsSync(path.join(tempDir, ".nojekyll")), "Patched pages repo must include .nojekyll");
assert(!privacyHtml.includes("<h2>External Links</h2>"), "Patched privacy policy must remove External Links");
assert(
  supportHtml.includes("You can update your name from Profile in the app menu"),
  "Patched support page must match current app navigation language"
);
assert(!/ko-fi|donat|support this work/i.test(supportHtml), "Patched support page must remove donation language");
assert(!/https?:\/\//i.test(supportHtml), "Patched support page must not include external URLs");

fs.rmSync(tempDir, { force: true, recursive: true });
console.log("GitHub Pages patch applies cleanly and produces the expected public files.");
