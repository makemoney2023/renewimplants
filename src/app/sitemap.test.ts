import { describe, expect, it } from "vitest";
import { getRouteSlugs } from "@/content/routes";
import { site } from "@/content/site";
import { getAllPosts } from "@/lib/blog";
import { QUIZ_PATH, QUIZ_THANK_YOU_PATH } from "@/lib/quiz/constants";
import sitemap from "./sitemap";

const urls = sitemap().map((entry) => entry.url);

describe("sitemap.xml", () => {
  it("lists the homepage and every content route", () => {
    expect(urls).toContain(`${site.url}/`);
    for (const slug of getRouteSlugs()) expect(urls).toContain(`${site.url}/${slug}`);
  });

  it("lists the blog, every published post, and the quiz", () => {
    expect(urls).toContain(`${site.url}/blog`);
    for (const post of getAllPosts()) expect(urls).toContain(`${site.url}${post.url}`);
    expect(urls).toContain(`${site.url}${QUIZ_PATH}`);
  });

  it("never lists the noindex thank-you page", () => {
    expect(urls.some((url) => url.includes(QUIZ_THANK_YOU_PATH))).toBe(false);
  });

  it("never lists the social preview", () => {
    expect(urls.some((url) => url.includes("/social-preview"))).toBe(false);
  });

  it("has no duplicate URLs", () => {
    expect(new Set(urls).size).toBe(urls.length);
  });
});
