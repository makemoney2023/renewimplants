// Pings IndexNow (Bing, Yandex, and the engines that read Bing's index such as
// ChatGPT search and Copilot) with every URL in the live sitemap.
// Run after each production deploy: npm run indexnow
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  INDEXNOW_ENDPOINT,
  buildIndexNowPayload,
  extractSitemapUrls,
  isValidIndexNowKey,
} from "../src/lib/indexnow.ts";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.renewimplants.ca").replace(/\/$/, "");
const key = process.env.INDEXNOW_KEY ?? "";

async function main() {
  if (!isValidIndexNowKey(key)) {
    throw new Error("INDEXNOW_KEY is missing or not 8–128 hex characters.");
  }
  const keyFile = readFileSync(join(import.meta.dirname, "..", "public", `${key}.txt`), "utf8").trim();
  if (keyFile !== key) {
    throw new Error(`public/${key}.txt must contain exactly the key.`);
  }

  const sitemap = await fetch(`${siteUrl}/sitemap.xml`);
  if (!sitemap.ok) throw new Error(`Sitemap fetch failed: ${sitemap.status}`);
  const urls = extractSitemapUrls(await sitemap.text());
  if (urls.length === 0) throw new Error("Sitemap has no <loc> entries.");

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(buildIndexNowPayload({ siteUrl, key, urls })),
  });
  const body = await response.text().catch(() => "");
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`IndexNow rejected the submission: ${response.status} ${body}`);
  }
  console.log(`IndexNow accepted ${urls.length} URLs (${response.status}).`);
}

main().catch((error: Error) => {
  console.error(`IndexNow submission failed: ${error.message}`);
  process.exitCode = 1;
});
