import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";

const root = join(import.meta.dirname, "..");
const dir = join(root, "content/blog");
const site = "https://www.renewimplants.ca";
const files = readdirSync(dir)
  .filter((name) => name.endsWith(".mdx"))
  .sort();
const posts = Object.fromEntries(files.map((name) => [name, readFileSync(join(dir, name), "utf8")]));
writeFileSync(join(root, "src/lib/blog-sources.json"), `${JSON.stringify(posts, null, 2)}\n`);

function isoDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "");
}

function plain(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const parsed = files
  .map((name) => {
    const raw = posts[name];
    const { data, content } = matter(raw);
    const slug = name.replace(/\.mdx$/, "");
    const tldr = content.match(/<Tldr>([\s\S]*?)<\/Tldr>/)?.[1] ?? "";
    return {
      slug,
      order: Number(data.order ?? 0),
      title: String(data.title ?? slug),
      description: String(data.description ?? ""),
      datePublished: isoDate(data.datePublished),
      dateModified: isoDate(data.dateModified),
      primaryQuery: String(data.primaryQuery ?? ""),
      takeaways: Array.isArray(data.takeaways) ? data.takeaways.map(String) : [],
      faqs: Array.isArray(data.faqs) ? data.faqs : [],
      citations: Array.isArray(data.citations) ? data.citations : [],
      imagePrompts: Array.isArray(data.imagePrompts) ? data.imagePrompts : [],
      tldr: plain(tldr),
    };
  })
  .sort((a, b) => a.order - b.order);

const full = [
  "# Renew Implant Centre — full answers",
  "",
  "> Generated from content/blog by scripts/embed-blog.mjs. Do not edit by hand.",
  "",
  ...parsed.flatMap((post) => {
    const lines = [
      `## ${post.title}`,
      "",
      `URL: ${site}/blog/${post.slug}`,
      `Published: ${post.datePublished}`,
      `Updated: ${post.dateModified}`,
      `Query: ${post.primaryQuery}`,
      "",
      post.description,
      "",
    ];
    if (post.tldr) {
      lines.push("Short answer:", "", post.tldr, "");
    }
    if (post.takeaways.length) {
      lines.push("Key takeaways:", "", ...post.takeaways.map((item) => `- ${item}`), "");
    }
    if (post.faqs.length) {
      lines.push("Questions:", "");
      for (const faq of post.faqs) {
        lines.push(`Q: ${faq.q}`, `A: ${faq.a}`, "");
      }
    }
    if (post.citations.length) {
      lines.push("Sources:", "");
      for (const citation of post.citations) {
        lines.push(`- ${citation.title} (${citation.publisher}): ${citation.url}`);
      }
      lines.push("");
    }
    return lines;
  }),
].join("\n");
writeFileSync(join(root, "public/llms-full.txt"), full.endsWith("\n") ? full : `${full}\n`);

const prompted = parsed.filter((post) => post.imagePrompts.length > 0);
const catalog = [
  "# Blog image prompts",
  "",
  "Photographer briefs for an image generator. Generated from post frontmatter by scripts/embed-blog.mjs. Do not edit by hand.",
  "",
  "Each brief asks for documentary or editorial photography: natural window light, a named lens and aperture, candid posture, real skin texture, everyday clothes, ordinary clutter, and slight film grain. The avoid line is part of the brief.",
  "",
  ...prompted.flatMap((post) => {
    const lines = [`## ${post.title}`, "", `Slug: \`${post.slug}\``, ""];
    post.imagePrompts.forEach((item, index) => {
      lines.push(
        `### ${index + 1}. ${item.placement}`,
        "",
        `- Aspect ratio: ${item.aspectRatio}`,
        `- Alt text: ${item.alt}`,
        `- Avoid: ${item.avoid}`,
        "",
        item.prompt.trim(),
        "",
      );
    });
    return lines;
  }),
].join("\n");
writeFileSync(join(root, "docs/content/image-prompts-wave-1.md"), catalog.endsWith("\n") ? catalog : `${catalog}\n`);
