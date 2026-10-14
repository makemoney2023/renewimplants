import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { AUTHOR_KEYS } from "@/content/authors";
import embeddedPosts from "./blog-sources.json";

export const BLOG_DIR = join(process.cwd(), "content", "blog");

export const BLOG_CLUSTERS = [
  "all-on-4",
  "dentures-vs-implants",
  "cost-coverage",
  "candidacy-recovery",
  "anxiety-sedation",
  "local",
  "risks",
] as const;

export const BLOG_PILLARS = [
  "cost-financing",
  "candidacy",
  "all-on-4",
  "procedure-recovery",
  "comparisons",
  "risks-faqs",
  "local-ottawa",
] as const;

export type BlogPillar = (typeof BLOG_PILLARS)[number];

/** Hub already on the site. The breadcrumb and the pillar link use this, not a new /guides URL. */
export const PILLAR_META: Record<BlogPillar, { label: string; href: string }> = {
  "cost-financing": { label: "Cost and financing", href: "/pricing" },
  candidacy: { label: "Candidacy", href: "/what-to-expect" },
  "all-on-4": { label: "All-on-4", href: "/services/all-on-4-dental-implants" },
  "procedure-recovery": { label: "Procedure and recovery", href: "/what-to-expect" },
  comparisons: { label: "Comparisons", href: "/blog/dentures-vs-dental-implants" },
  "risks-faqs": { label: "Risks and FAQs", href: "/contact-us" },
  "local-ottawa": { label: "Ottawa and Orléans", href: "/service-areas" },
};

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD");

const citationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  publisher: z.string().min(1),
});

const imagePromptSchema = z.object({
  placement: z.string().min(1),
  prompt: z.string().min(1),
  aspectRatio: z.enum(["16:9", "4:3"]),
  alt: z.string().min(1),
  avoid: z.string().min(1),
});

const frontmatterSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
    datePublished: isoDate,
    dateModified: isoDate,
    cluster: z.enum(BLOG_CLUSTERS),
    pillar: z.enum(BLOG_PILLARS),
    primaryQuery: z.string().min(1),
    author: z.enum(AUTHOR_KEYS),
    // Set only after a clinician has actually reviewed the post.
    reviewedBy: z.enum(AUTHOR_KEYS).optional(),
    lastReviewed: isoDate.optional(),
    quizCtaLabel: z.string().min(1),
    order: z.number(),
    faqs: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).min(3),
    heroImage: z.string().startsWith("/").optional(),
    heroImageAlt: z.string().optional(),
    takeaways: z.array(z.string().min(1)).min(3).max(5).optional(),
    citations: z.array(citationSchema).default([]),
    imagePrompts: z.array(imagePromptSchema).default([]),
  })
  .refine((data) => Boolean(data.reviewedBy) === Boolean(data.lastReviewed), {
    message: "reviewedBy and lastReviewed must be set together",
  })
  .refine((data) => !data.heroImage || Boolean(data.heroImageAlt?.trim()), {
    message: "heroImageAlt is required when heroImage is set",
  });

export type BlogFrontmatter = z.infer<typeof frontmatterSchema>;
export type BlogCitation = BlogFrontmatter["citations"][number];
export type BlogImagePrompt = BlogFrontmatter["imagePrompts"][number];
export type BlogHeading = { id: string; text: string };

export type BlogPost = BlogFrontmatter & {
  slug: string;
  url: string;
  body: string;
  headings: BlogHeading[];
  readingMinutes: number;
};

/** Crumbs after Home. Schema and the visible trail both use this list. */
export function postCrumbs(post: Pick<BlogPost, "pillar" | "title" | "url">) {
  const pillar = PILLAR_META[post.pillar];
  return [
    { name: "Blog", path: "/blog" },
    { name: pillar.label, path: pillar.href },
    { name: post.title, path: post.url },
  ];
}

export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function extractHeadings(body: string): BlogHeading[] {
  return [...body.matchAll(/^## (.+)$/gm)].map((match) => {
    const text = match[1].trim();
    return { id: slugifyHeading(text), text };
  });
}

export function readingMinutes(body: string) {
  const words = body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function readMdxFiles(dir: string): { file: string; raw: string }[] {
  try {
    return readdirSync(dir)
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => ({ file, raw: readFileSync(join(dir, file), "utf8") }));
  } catch (error) {
    // Workers has no source tree. The embedded copy is produced by scripts/embed-blog.mjs.
    if (dir !== BLOG_DIR) throw error;
    return Object.entries(embeddedPosts).map(([file, raw]) => ({ file, raw }));
  }
}

export function loadPosts(dir = BLOG_DIR, now = new Date()): BlogPost[] {
  const today = now.toISOString().slice(0, 10);

  return readMdxFiles(dir)
    .map(({ file, raw }) => {
      const { data, content } = matter(raw);
      const parsed = frontmatterSchema.safeParse({
        ...data,
        // YAML turns bare dates into Date objects; the schema wants ISO strings.
        ...Object.fromEntries(
          ["datePublished", "dateModified", "lastReviewed"].map((key) => [
            key,
            data[key] instanceof Date ? data[key].toISOString().slice(0, 10) : data[key],
          ]),
        ),
      });
      if (!parsed.success) {
        throw new Error(`Invalid frontmatter in content/blog/${file}: ${parsed.error.message}`);
      }
      const slug = file.replace(/\.mdx$/, "");
      return {
        ...parsed.data,
        slug,
        url: `/blog/${slug}`,
        body: content,
        headings: extractHeadings(content),
        readingMinutes: readingMinutes(content),
      };
    })
    .filter((post) => post.datePublished <= today)
    .sort((a, b) => a.order - b.order);
}

export function getAllPosts() {
  return loadPosts();
}

export function getPost(slug: string) {
  return getAllPosts().find((post) => post.slug === slug);
}

/**
 * Same-cluster neighbours first, then the global-order successor (so every post
 * receives at least one inbound related link), then other clusters rotated by
 * the post's order so cross-links spread across the archive.
 */
export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const all = getAllPosts();
  const current = all.find((post) => post.slug === slug);
  if (!current) return [];

  const related: BlogPost[] = [];
  const seen = new Set([slug]);
  const add = (post: BlogPost) => {
    if (seen.has(post.slug) || related.length >= limit) return;
    related.push(post);
    seen.add(post.slug);
  };

  const cluster = all.filter((post) => post.cluster === current.cluster);
  const index = cluster.findIndex((post) => post.slug === slug);
  for (let step = 1; step < cluster.length; step++) {
    add(cluster[(index + step) % cluster.length]);
    add(cluster[(index - step + cluster.length) % cluster.length]);
  }

  const successor = all[(all.findIndex((post) => post.slug === slug) + 1) % all.length];
  if (successor && !seen.has(successor.slug)) {
    if (related.length >= limit) {
      seen.delete(related[related.length - 1].slug);
      related.pop();
    }
    add(successor);
  }

  const others = all.filter((post) => !seen.has(post.slug));
  const offset = others.length ? current.order % others.length : 0;
  for (const post of [...others.slice(offset), ...others.slice(0, offset)]) add(post);

  return related;
}
