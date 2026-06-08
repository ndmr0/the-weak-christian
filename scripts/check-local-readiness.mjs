import { spawnSync } from "node:child_process";

const steps = [
  ["node", ["scripts/package-public-pages.mjs"]],
  ["node", ["scripts/create-app-store-screenshots.mjs"]],
  ["node", ["scripts/validate-data.mjs"]],
  ["node", ["scripts/check-app-flow.mjs"]],
  ["node", ["scripts/check-today-layout.mjs"]],
  ["node", ["scripts/check-review-assets.mjs"]],
  ["node", ["scripts/check-store-readiness.mjs"]],
  ["node", ["scripts/create-review-handoff.mjs"]],
  ["node", ["scripts/check-submission-readiness.mjs"]]
];

for (const [command, args] of steps) {
  const result = spawnSync(command === "node" ? process.execPath : command, args, {
    stdio: "inherit"
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Local readiness checks passed.");
