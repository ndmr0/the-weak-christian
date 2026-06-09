import { spawnSync } from "node:child_process";
import fs from "node:fs";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function npmCommand() {
  const localNpm = ".local/npm/bin/npm-cli.js";

  if (fs.existsSync(localNpm)) {
    return [process.execPath, [localNpm]];
  }

  return ["npm", []];
}

run(process.execPath, ["scripts/check-local-readiness.mjs"]);
run(process.execPath, ["scripts/check-public-pages.mjs"]);
run("node_modules/.bin/expo", ["export", "--platform", "ios", "--dev", "--output-dir", "/tmp/twc-check-ios", "--clear"]);
run("node_modules/.bin/expo", ["export", "--platform", "android", "--dev", "--output-dir", "/tmp/twc-check-android", "--clear"]);

const [npm, npmArgs] = npmCommand();
run(npm, [...npmArgs, "audit", "--omit=dev", "--audit-level=high"]);
run(process.execPath, ["scripts/check-eas-ios-production-build.mjs"]);

console.log("Release readiness checks passed.");
