import { describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { QUIZ_THANK_YOU_PATH } from "@/lib/quiz/constants";
import robots from "./robots";

type Rule = { userAgent?: string | string[]; allow?: string | string[]; disallow?: string | string[] };

const rules = robots().rules as Rule[];
const agents = (rule: Rule) => [rule.userAgent ?? []].flat();
const ruleFor = (agent: string) => rules.find((rule) => agents(rule).includes(agent));

describe("robots.txt", () => {
  it.each([
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "PerplexityBot",
    "ClaudeBot",
    "Claude-SearchBot",
    "Google-Extended",
    "Applebot-Extended",
    "Googlebot",
    "Bingbot",
  ])("lets %s crawl the public site", (agent) => {
    expect(ruleFor(agent)?.allow).toContain("/");
  });

  it.each(["Bytespider", "CCBot"])("blocks %s entirely", (agent) => {
    expect(ruleFor(agent)?.disallow).toEqual(["/"]);
  });

  it("keeps the API and the lead thank-you page out of every index", () => {
    for (const rule of rules.filter((rule) => rule.allow)) {
      expect(rule.disallow).toEqual(expect.arrayContaining(["/api/", QUIZ_THANK_YOU_PATH, "/social-preview"]));
    }
  });

  it("declares the sitemap on the canonical host", () => {
    expect(robots().sitemap).toBe(`${site.url}/sitemap.xml`);
  });
});
