import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { QUIZ_THANK_YOU_PATH } from "@/lib/quiz/constants";

const PRIVATE_PATHS = ["/api/", QUIZ_THANK_YOU_PATH];

// Retrieval and training bots behind ChatGPT, Perplexity, Claude, Gemini, and
// Apple/Amazon assistants. Blocking any of them removes the clinic from that
// engine's answers, so they get the same access as Googlebot.
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
