import type { MetadataRoute } from "next";
import { site } from "@/content/load";

const PRIVATE_PATHS = ["/api/"];

const AI_BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_BOTS, allow: ["/"], disallow: PRIVATE_PATHS },
      { userAgent: ["Googlebot", "Bingbot"], allow: ["/"], disallow: PRIVATE_PATHS },
      { userAgent: ["Bytespider", "CCBot"], disallow: ["/"] },
      { userAgent: "*", allow: ["/"], disallow: PRIVATE_PATHS },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
