import { spawnSync } from "node:child_process";

const result = spawnSync("/usr/bin/python3", ["scripts/create-app-store-screenshots.py"], {
  stdio: "inherit"
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
