import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { authors } from "@/content/authors";
import { QUIZ_PATH } from "@/lib/quiz/constants";
import {
  extractHeadings,
  getAllPosts,
  getPost,
  getRelatedPosts,
  loadPosts,
  readingMinutes,
} from "./blog";

const LEGACY_SLUGS = [
  "why-people-are-choosing-all-on-4",
  "dentures-vs-dental-implants",
  "same-day-dental-implants-new-teeth-one-day",
  "all-on-4-dental-implants-after-years-of-missing-teeth",
  "full-arch-vs-individual-dental-implants",
];

describe("published posts", () => {
  const posts = getAllPosts();

  it("keeps every legacy blog URL", () => {
    expect(posts.map((post) => post.slug)).toEqual(expect.arrayContaining(LEGACY_SLUGS));
    for (const post of posts) expect(post.url).toBe(`/blog/${post.slug}`);
  });

  it("sorts by order and has unique slugs", () => {
    const orders = posts.map((post) => post.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(new Set(posts.map((post) => post.slug)).size).toBe(posts.length);
  });

  it.each(getAllPosts().map((post) => [post.slug, post]))("%s meets the content rules", (_slug, post) => {
    expect(post.title.length).toBeLessThanOrEqual(70);
    expect(post.description.length).toBeGreaterThanOrEqual(110);
    expect(post.description.length).toBeLessThanOrEqual(165);
    expect(post.faqs.length).toBeGreaterThanOrEqual(3);
    expect(authors[post.author]).toBeDefined();
    if (post.reviewedBy) expect(authors[post.reviewedBy]).toBeDefined();
    expect(post.body).toMatch(/<BlogCta/);
    expect(post.body).toMatch(/<ExtractionTable/);
    expect(post.body).toMatch(/^## Sources/m);
    expect(post.headings.every((heading) => heading.text.endsWith("?") || heading.text === "Sources" || heading.text.startsWith("Why "))).toBe(true);
  });

  it("never quotes prices or calls the denturist a doctor", () => {
    for (const post of posts) {
      const text = `${post.title} ${post.description} ${post.body} ${JSON.stringify(post.faqs)}`;
      expect(text, post.slug).not.toMatch(/\$\s?\d/);
      expect(text, post.slug).not.toMatch(/Dr\.?\s*(Tom|Szarski)/);
      expect(text, post.slug).not.toMatch(/guarantee/i);
    }
  });

  it("points every call to action at the quiz", () => {
    for (const post of posts) expect(post.body, post.slug).not.toMatch(/<BlogCta[^>]*href=/);
    expect(QUIZ_PATH).toBe("/implant-candidate-quiz");
  });
});

describe("loadPosts", () => {
  const dir = mkdtempSync(join(tmpdir(), "renew-blog-"));
  const frontmatter = (overrides: Record<string, string>) =>
    [
      "---",
      ...Object.entries({
        title: "A title?",
        description: "d".repeat(140),
        datePublished: "2026-09-01",
        dateModified: "2026-09-01",
        cluster: "all-on-4",
        primaryQuery: "q",
        author: "tom-szarski",
        quizCtaLabel: "Take the quiz",
        order: "1",
        ...overrides,
      }).map(([key, value]) => `${key}: ${value}`),
      "faqs:",
      "  - q: One?",
      "    a: Yes.",
      "  - q: Two?",
      "    a: Yes.",
      "  - q: Three?",
      "    a: Yes.",
      "---",
      "",
      "## Is this a heading?",
      "",
      "Body text.",
    ].join("\n");

  writeFileSync(join(dir, "live.mdx"), frontmatter({}));
  writeFileSync(join(dir, "future.mdx"), frontmatter({ datePublished: "2099-01-01", order: "2" }));

  it("hides posts until their publish date", () => {
    const now = new Date("2026-09-29T12:00:00Z");
    expect(loadPosts(dir, now).map((post) => post.slug)).toEqual(["live"]);
  });

  it("fails loudly on invalid frontmatter", () => {
    const bad = mkdtempSync(join(tmpdir(), "renew-blog-bad-"));
    writeFileSync(join(bad, "bad.mdx"), frontmatter({ cluster: "nope" }));
    expect(() => loadPosts(bad)).toThrow(/bad\.mdx/);
  });

  it("requires a review date whenever a reviewer is named", () => {
    const bad = mkdtempSync(join(tmpdir(), "renew-blog-review-"));
    writeFileSync(join(bad, "half.mdx"), frontmatter({ reviewedBy: "tom-szarski" }));
    expect(() => loadPosts(bad)).toThrow(/reviewedBy and lastReviewed/);
  });
});

describe("helpers", () => {
  it("extracts H2 headings with stable ids", () => {
    expect(extractHeadings("## What is All-on-4?\ntext\n### Sub\n## Sources")).toEqual([
      { id: "what-is-all-on-4", text: "What is All-on-4?" },
      { id: "sources", text: "Sources" },
    ]);
  });

  it("estimates reading time at 200 words per minute, minimum one", () => {
    expect(readingMinutes("word ".repeat(450))).toBe(3);
    expect(readingMinutes("short")).toBe(1);
  });

  it("finds a post by slug", () => {
    expect(getPost(LEGACY_SLUGS[0])?.slug).toBe(LEGACY_SLUGS[0]);
    expect(getPost("missing")).toBeUndefined();
  });

  it("gives every post related links, never itself, and leaves no post orphaned", () => {
    const posts = getAllPosts();
    const inbound = new Map(posts.map((post) => [post.slug, 0]));
    for (const post of posts) {
      const related = getRelatedPosts(post.slug);
      expect(related.length).toBe(Math.min(3, posts.length - 1));
      expect(related.map((entry) => entry.slug)).not.toContain(post.slug);
      for (const entry of related) inbound.set(entry.slug, (inbound.get(entry.slug) ?? 0) + 1);
    }
    for (const [slug, count] of inbound) expect(count, slug).toBeGreaterThan(0);
  });
});

describe("quiz CTA labels", () => {
  it("never promise a faster quiz than the two minutes the landing page states", () => {
    for (const post of getAllPosts()) {
      expect(post.quizCtaLabel, post.slug).not.toMatch(/\b(60|sixty|30|thirty)[- ]second/i);
    }
  });
});
