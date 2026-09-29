import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { getRouteSlugs } from "@/content/routes";
import { getAllPosts } from "./blog";
import { QUIZ_PATH, QUIZ_THANK_YOU_PATH } from "./quiz/constants";
import { getIndexablePaths, isInternalPage } from "./site-pages";

describe("getIndexablePaths", () => {
  const paths = getIndexablePaths();

  it("covers home, content routes, the blog, every post, and the quiz", () => {
    expect(paths).toContain("/");
    for (const slug of getRouteSlugs()) expect(paths).toContain(`/${slug}`);
    expect(paths).toContain("/blog");
    for (const post of getAllPosts()) expect(paths).toContain(post.url);
    expect(paths).toContain(QUIZ_PATH);
  });

  it("excludes the noindex thank-you page and has no duplicates", () => {
    expect(paths).not.toContain(QUIZ_THANK_YOU_PATH);
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe("isInternalPage", () => {
  it("recognises real pages, ignoring query strings and hashes", () => {
    expect(isInternalPage("/blog/dentures-vs-dental-implants")).toBe(true);
    expect(isInternalPage(`${QUIZ_PATH}?utm_source=blog`)).toBe(true);
    expect(isInternalPage(QUIZ_THANK_YOU_PATH)).toBe(true);
    expect(isInternalPage("/faq#top")).toBe(true);
  });

  it("rejects unknown paths", () => {
    expect(isInternalPage("/blog/not-a-post")).toBe(false);
    expect(isInternalPage("/nope")).toBe(false);
  });
});

describe("public/llms.txt", () => {
  const llms = readFileSync(join(process.cwd(), "public", "llms.txt"), "utf8");
  const links = [...llms.matchAll(/\]\((https?:[^)]+)\)/g)].map((match) => match[1]);

  it("only links to live pages on this site", () => {
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.startsWith(site.url), link).toBe(true);
      expect(isInternalPage(link.slice(site.url.length) || "/"), link).toBe(true);
    }
  });

  it("lists every published post and the quiz", () => {
    for (const post of getAllPosts()) expect(links).toContain(`${site.url}${post.url}`);
    expect(links).toContain(`${site.url}${QUIZ_PATH}`);
  });
});
