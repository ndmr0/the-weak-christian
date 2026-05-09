import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ASSETS_DIR = "assets";
const SVG_PATH = path.join(ASSETS_DIR, "wordmark-icon.svg");
const THUMBNAIL_PATH = `${SVG_PATH}.png`;
const ICON_PATHS = [
  path.join(ASSETS_DIR, "icon.png"),
  path.join(ASSETS_DIR, "adaptive-icon.png"),
  path.join(ASSETS_DIR, "logo-mark.png")
];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#ffffff"/>
  <g fill="#050505" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" font-weight="900">
    <text x="130" y="380" font-size="180">The</text>
    <text x="130" y="535" font-size="180">Weak</text>
    <text x="130" y="690" font-size="180">Christian</text>
  </g>
</svg>
`;

fs.mkdirSync(ASSETS_DIR, { recursive: true });
fs.writeFileSync(SVG_PATH, svg);

const renderResult = spawnSync("qlmanage", ["-t", "-s", "1024", "-o", ASSETS_DIR, SVG_PATH], {
  encoding: "utf8"
});

if (renderResult.status !== 0) {
  throw new Error(`Could not render ${SVG_PATH} with qlmanage.\n${renderResult.stderr}`);
}

if (!fs.existsSync(THUMBNAIL_PATH)) {
  throw new Error(`Expected rendered icon at ${THUMBNAIL_PATH}`);
}

ICON_PATHS.forEach((iconPath) => {
  fs.copyFileSync(THUMBNAIL_PATH, iconPath);
});

fs.rmSync(THUMBNAIL_PATH, { force: true });

console.log(`Wrote ${ICON_PATHS.join(", ")}`);
