import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const root = process.cwd();
const metadata = fs.readFileSync(path.join(root, "app-store-metadata.md"), "utf8");
const errors = [];

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function extractMetadataUrl(label) {
  const match = metadata.match(new RegExp(`${label}:\\n([^\\n]+)`, "i"));
  return match?.[1]?.trim();
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          response.resume();
          reject(new Error(`${url} returned HTTP ${response.statusCode}`));
          return;
        }

        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => resolve(body));
      })
      .on("error", reject);
  });
}

const privacyUrl = extractMetadataUrl("Privacy Policy URL");
const supportUrl = extractMetadataUrl("Support URL");
const marketingUrl = extractMetadataUrl("Marketing URL");

for (const [label, url] of [
  ["Privacy Policy URL", privacyUrl],
  ["Support URL", supportUrl],
  ["Marketing URL", marketingUrl]
]) {
  assert(url?.startsWith("https://"), `${label} must be an HTTPS URL`);
}

const [privacyHtml, supportHtml, marketingHtml] = await Promise.all([
  fetchText(privacyUrl),
  fetchText(supportUrl),
  fetchText(marketingUrl)
]);

assert(privacyHtml.includes("Daily Notes of Grace Privacy Policy"), "Hosted privacy policy must have the expected title");
assert(privacyHtml.includes("Daily Notes of Grace does not use accounts, advertising, analytics, or tracking"), "Hosted privacy policy must match current no-tracking language");
assert(!privacyHtml.includes("<h2>External Links</h2>"), "Hosted privacy policy must not include the removed External Links section");
assert(!/https?:\/\//i.test(privacyHtml), "Hosted privacy policy should not include external URLs");

assert(supportHtml.includes("Daily Notes of Grace Support"), "Hosted support page must have the expected title");
assert(supportHtml.includes("You can update your name from Profile in the app menu"), "Hosted support page must match current app navigation language");
assert(!/ko-fi|donat|support this work/i.test(supportHtml), "Hosted support page must not include donation language or Ko-fi links");
assert(!/https?:\/\//i.test(supportHtml), "Hosted support page should not include external URLs");

assert(marketingHtml.includes("The<br>Weak<br>Christian"), "Hosted marketing page must show the app wordmark");
assert(marketingHtml.includes("Privacy Policy"), "Hosted marketing page must link to privacy policy");
assert(marketingHtml.includes("Support"), "Hosted marketing page must link to support");

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Public page checks passed.");
