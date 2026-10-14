import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import embeddedPosts from "./blog-sources.json";
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
import { toPostCard } from "./blog-cards";

const LEGACY_SLUGS = [
  "why-people-are-choosing-all-on-4",
  "dentures-vs-dental-implants",
  "same-day-dental-implants-new-teeth-one-day",
  "all-on-4-dental-implants-after-years-of-missing-teeth",
  "full-arch-vs-individual-dental-implants",
];

describe("embedded blog sources", () => {
  it("matches every file in content/blog so Workers can render without a filesystem", () => {
    const files = readdirSync(join(process.cwd(), "content", "blog"))
      .filter((name) => name.endsWith(".mdx"))
      .sort();
    expect(Object.keys(embeddedPosts).sort()).toEqual(files);
    for (const file of files) {
      expect(embeddedPosts[file as keyof typeof embeddedPosts]).toBe(
        readFileSync(join(process.cwd(), "content", "blog", file), "utf8"),
      );
    }
  });
});

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

  it("gives photographed posts their own hero and uses the cluster photo until images land", () => {
    const ready = posts.filter((post) => post.heroImage);
    const pending = posts.filter((post) => !post.heroImage);
    const readyImages = ready.map((post) => toPostCard(post).image);
    expect(new Set(readyImages).size).toBe(ready.length);
    for (const post of ready) {
      expect(post.heroImage).toBe(`/media/blog/${post.slug}.jpg`);
      expect(post.heroImageAlt?.trim().length).toBeGreaterThan(20);
      for (const name of [`${post.slug}.jpg`, `${post.slug}-2.jpg`, `${post.slug}-3.jpg`]) {
        expect(existsSync(join(process.cwd(), "assets", "blog", name)), name).toBe(true);
      }
      expect(toPostCard(post).image).toBe(post.heroImage);
      expect(toPostCard(post).imageAlt).toBe(post.heroImageAlt);
    }
    for (const post of pending) {
      expect(post.imagePrompts, post.slug).toHaveLength(3);
      expect(post.imagePrompts[0]?.aspectRatio, post.slug).toBe("16:9");
      expect(
        post.imagePrompts.slice(1).every((item) => item.aspectRatio === "4:3"),
        post.slug,
      ).toBe(true);
      const card = toPostCard(post);
      expect(card.image.startsWith("/media/"), post.slug).toBe(true);
      expect(card.image.includes(post.slug), post.slug).toBe(false);
      for (const name of [`${post.slug}.jpg`, `${post.slug}-2.jpg`, `${post.slug}-3.jpg`]) {
        expect(existsSync(join(process.cwd(), "assets", "blog", name)), name).toBe(false);
      }
    }
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
        pillar: "all-on-4",
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

const WAVE_1_SLUGS = [
  "does-the-canadian-dental-care-plan-cover-dental-implants",
  "dental-implants-with-bone-loss",
  "snap-on-dentures-vs-all-on-4",
  "all-on-4-recovery-first-weeks",
  "how-long-do-all-on-4-implants-last",
  "sedation-for-dental-implant-surgery",
  "dental-implants-with-diabetes-or-smoking",
  "denturist-vs-dentist-for-implant-teeth",
  "what-is-included-in-an-implant-quote",
  "dental-implant-not-feeling-right",
];

describe("wave 1 posts", () => {
  it("answers the query, cites sources, and briefs three photographs", () => {
    const catalog = readFileSync(join(process.cwd(), "docs/content/image-prompts-wave-1.md"), "utf8");
    for (const slug of WAVE_1_SLUGS) {
      const post = getPost(slug);
      expect(post, slug).toBeDefined();
      if (!post) continue;
      expect(post.description.toLowerCase(), slug).toContain(post.primaryQuery.toLowerCase());
      expect(post.body, slug).toMatch(/<Tldr>/);
      expect(post.body, slug).toMatch(/<KeyTakeaways\s*\/>/);
      expect(post.body, slug).toMatch(/<References\s*\/>/);
      expect(post.takeaways?.length, slug).toBeGreaterThanOrEqual(3);
      expect(post.citations.length, slug).toBeGreaterThan(0);
      expect(post.reviewedBy, slug).toBeUndefined();
      expect(post.imagePrompts, slug).toHaveLength(3);
      expect(post.imagePrompts[0]?.aspectRatio, slug).toBe("16:9");
      expect(post.imagePrompts.slice(1).every((item) => item.aspectRatio === "4:3"), slug).toBe(true);
      for (const item of post.imagePrompts) {
        expect(item.avoid.length, slug).toBeGreaterThan(20);
        expect(item.prompt.toLowerCase(), slug).toContain("avoid");
        expect(item.prompt, slug).toMatch(/35mm|50mm/);
        expect(item.prompt, slug).toMatch(/f\/2\.8/);
      }
      const ids = [...post.body.matchAll(/<Cite id="([^"]+)"/g)].map((match) => match[1]);
      expect(ids.length, slug).toBeGreaterThan(0);
      for (const id of ids) {
        expect(post.citations.some((citation) => citation.id === id), `${slug} ${id}`).toBe(true);
      }
      expect(catalog, slug).toContain(slug);
    }
  });
});

const WAVE_2_SLUGS = [
  "all-on-4-vs-all-on-6",
  "what-is-all-on-4",
  "temporary-teeth-after-all-on-4",
  "when-do-you-get-final-teeth-after-all-on-4",
  "on-site-dental-lab-for-all-on-4",
  "dental-implants-vs-bridge",
  "denture-adhesive-vs-implants",
  "upper-denture-vs-all-on-4",
  "lower-denture-vs-implants",
];

describe("wave 2 posts", () => {
  it("answers the query, cites sources, and briefs three photographs without files yet", () => {
    const catalog = readFileSync(join(process.cwd(), "docs/content/image-prompts-wave-1.md"), "utf8");
    for (const slug of WAVE_2_SLUGS) {
      const post = getPost(slug);
      expect(post, slug).toBeDefined();
      if (!post) continue;
      expect(post.description.toLowerCase(), slug).toContain(post.primaryQuery.toLowerCase());
      expect(post.body, slug).toMatch(/<Tldr>/);
      expect(post.body, slug).toMatch(/<KeyTakeaways\s*\/>/);
      expect(post.body, slug).toMatch(/<References\s*\/>/);
      expect(post.takeaways?.length, slug).toBeGreaterThanOrEqual(3);
      expect(post.citations.length, slug).toBeGreaterThan(0);
      expect(post.reviewedBy, slug).toBeUndefined();
      expect(post.heroImage, slug).toBeUndefined();
      expect(post.imagePrompts, slug).toHaveLength(3);
      expect(post.imagePrompts[0]?.aspectRatio, slug).toBe("16:9");
      expect(post.imagePrompts.slice(1).every((item) => item.aspectRatio === "4:3"), slug).toBe(true);
      for (const item of post.imagePrompts) {
        expect(item.avoid.length, slug).toBeGreaterThan(20);
        expect(item.prompt.toLowerCase(), slug).toContain("avoid");
        expect(item.prompt, slug).toMatch(/35mm|50mm/);
        expect(item.prompt, slug).toMatch(/f\/2\.8/);
      }
      const ids = [...post.body.matchAll(/<Cite id="([^"]+)"/g)].map((match) => match[1]);
      expect(ids.length, slug).toBeGreaterThan(0);
      for (const id of ids) {
        expect(post.citations.some((citation) => citation.id === id), `${slug} ${id}`).toBe(true);
      }
      expect(catalog, slug).toContain(slug);
    }
  });
});

describe("quiz CTA labels", () => {
  it("never promise a faster quiz than the two minutes the landing page states", () => {
    for (const post of getAllPosts()) {
      expect(post.quizCtaLabel, post.slug).not.toMatch(/\b(60|sixty|30|thirty)[- ]second/i);
    }
  });
});
