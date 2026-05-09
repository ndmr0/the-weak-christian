import fs from "node:fs";
import path from "node:path";

const inputPath = path.resolve("encouragements_kjv_1000.jsonl");
const outputPath = path.resolve("src/data/encouragements.json");

const lines = fs.readFileSync(inputPath, "utf8").trim().split("\n");
const records = lines.map((line) => JSON.parse(line));

fs.writeFileSync(outputPath, `${JSON.stringify(records, null, 2)}\n`);

console.log(`Wrote ${records.length} records to ${outputPath}`);
