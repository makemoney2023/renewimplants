import { site } from "@/content/site";
import type { BlogPost } from "./blog";
import { BLOG_NAME } from "./blog-schema";

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const rfc822 = (date: string) => new Date(date).toUTCString();

export function buildRssFeed(posts: BlogPost[]) {
  const items = posts
    .map((post) => {
      const url = `${site.url}${post.url}`;
      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<description>${escapeXml(post.description)}</description>`,
        `<pubDate>${rfc822(post.datePublished)}</pubDate>`,
        "</item>",
      ].join("");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escapeXml(BLOG_NAME)}</title>
<link>${site.url}/blog</link>
<description>${escapeXml(`Plain-language answers about dental implants and dentures from ${site.name} in Orléans, Ottawa.`)}</description>
<language>en-CA</language>
<atom:link href="${site.url}/blog/rss.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>
`;
}
