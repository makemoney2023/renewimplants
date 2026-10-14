import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getAllPosts } from "@/lib/blog";
import {
  bodyBlogLinks,
  buildLinkMap,
  inboundCounts,
  knownInternalPaths,
  linkMapSummary,
  markdownLinks,
  pillarHrefFor,
} from "@/lib/internal-links";
import { QUIZ_PATH } from "@/lib/quiz/constants";

const WAVE_1 = [
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

const OLDER = [
  "why-people-are-choosing-all-on-4",
  "dentures-vs-dental-implants",
  "same-day-dental-implants-new-teeth-one-day",
  "all-on-4-dental-implants-after-years-of-missing-teeth",
  "full-arch-vs-individual-dental-implants",
];

describe("internal link map", () => {
  const posts = getAllPosts();
  const edges = buildLinkMap(posts);
  const known = knownInternalPaths(posts);

  it("has no broken internal links", () => {
    const broken = edges.filter((edge) => !known.has(edge.to));
    expect(broken).toEqual([]);
  });

  it("leaves no post without an inbound link", () => {
    const inbound = inboundCounts(edges, posts);
    const orphans = [...inbound.entries()].filter(([, count]) => count === 0);
    expect(orphans).toEqual([]);
  });

  it("gives every post a pillar link, two to four related posts, and the quiz", () => {
    for (const post of posts) {
      const targets = new Set(markdownLinks(post).map((link) => link.to));
      expect(targets.has(pillarHrefFor(post)), `${post.slug} pillar`).toBe(true);
      const related = bodyBlogLinks(post).filter((href) => href !== post.url);
      expect(related.length, post.slug).toBeGreaterThanOrEqual(2);
      expect(related.length, post.slug).toBeLessThanOrEqual(4);
      expect(post.body.includes("<BlogCta") || targets.has(QUIZ_PATH), post.slug).toBe(true);
    }
  });

  it("links each older post to at least one Wave 1 article", () => {
    for (const slug of OLDER) {
      const post = posts.find((entry) => entry.slug === slug);
      expect(post, slug).toBeDefined();
      const linked = bodyBlogLinks(post!).some((href) => WAVE_1.some((wave) => href.endsWith(wave)));
      expect(linked, slug).toBe(true);
    }
  });

  it("reports a populated link map", () => {
    const summary = linkMapSummary(posts);
    expect(summary.posts).toBe(posts.length);
    expect(summary.edges).toBeGreaterThan(posts.length * 3);
    expect(summary.hubEdges).toBeGreaterThan(0);
    expect(summary.broken).toBe(0);
    expect(summary.orphans).toBe(0);
    expect(summary.minInbound).toBeGreaterThan(0);
  });
});

describe("client blog components", () => {
  it("does not value-import the Node blog loader", () => {
    const source = readFileSync(new URL("../components/blog/mdx-components.tsx", import.meta.url), "utf8");
    expect(source).not.toMatch(/import\s*\{[^}]*slugifyHeading[^}]*\}\s*from\s*"@\/lib\/blog"/);
    expect(source).toMatch(/from "@\/lib\/blog-text"/);
  });
});
