import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site-origin";

const PRIVATE_PATHS = ["/api/", "/implant-candidate-quiz/thank-you"];

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
  const origin = siteOrigin();
  return {
    rules: [
      { userAgent: AI_BOTS, allow: ["/"], disallow: PRIVATE_PATHS },
      { userAgent: ["Googlebot", "Bingbot"], allow: ["/"], disallow: PRIVATE_PATHS },
      { userAgent: ["Bytespider", "CCBot"], disallow: ["/"] },
      { userAgent: "*", allow: ["/"], disallow: PRIVATE_PATHS },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
