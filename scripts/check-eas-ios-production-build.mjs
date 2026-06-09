import { spawnSync } from "node:child_process";
import fs from "node:fs";

function npxCommand() {
  const localNpx = ".local/npm/bin/npx-cli.js";

  if (fs.existsSync(localNpx)) {
    return [process.execPath, [localNpx]];
  }

  return ["npx", []];
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
    console.error(output || `${command} ${args.join(" ")} failed`);
    process.exit(result.status ?? 1);
  }

  return result.stdout;
}

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}

const [npx, npxArgs] = npxCommand();
const output = run(npx, [
  ...npxArgs,
  "eas-cli@latest",
  "build:list",
  "--platform",
  "ios",
  "--distribution",
  "store",
  "--limit",
  "1",
  "--json"
]);

const builds = JSON.parse(output);
const latest = builds[0];

assert(latest, "No iOS App Store production build was found on EAS.");
assert(latest.platform === "IOS", "Latest EAS build check did not return an iOS build.");
assert(latest.distribution === "STORE", "Latest iOS build is not an App Store distribution build.");

if (latest.status !== "FINISHED") {
  console.error(`Latest iOS App Store build is ${latest.status}.`);
  console.error(`Build ID: ${latest.id}`);
  console.error(`Build number: ${latest.appBuildVersion ?? "unknown"}`);

  if (/Push Notifications|aps-environment/i.test(latest.error?.message ?? "")) {
    console.error("");
    console.error("The current blocker is Apple provisioning, not app code.");
    console.error("Regenerate the iOS App Store provisioning profile with Push Notifications enabled:");
    console.error("npx eas-cli@latest credentials:configure-build --platform ios --profile production");
  } else if (latest.error?.message) {
    console.error("");
    console.error(latest.error.message);
  }

  process.exit(1);
}

assert(
  latest.artifacts?.applicationArchiveUrl,
  `Latest iOS App Store build ${latest.id} finished but has no application archive URL.`
);

console.log(
  `Latest iOS App Store build is finished: ${latest.id} (build ${latest.appBuildVersion}, commit ${latest.gitCommitHash})`
);
