import { describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { getAllPosts, type BlogPost } from "./blog";
import { buildRssFeed } from "./blog-rss";

describe("buildRssFeed", () => {
  it("renders an RSS 2.0 channel with one item per post", () => {
    const posts = getAllPosts();
    const xml = buildRssFeed(posts);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain(`<atom:link href="${site.url}/blog/rss.xml" rel="self" type="application/rss+xml"/>`);
    expect(xml.match(/<item>/g)).toHaveLength(posts.length);
    for (const post of posts) {
      expect(xml).toContain(`<guid isPermaLink="true">${site.url}${post.url}</guid>`);
    }
  });

  it("escapes XML special characters and uses RFC 822 dates", () => {
    const post = { ...getAllPosts()[0], title: "Dentures & <implants>", datePublished: "2026-09-29" } as BlogPost;
    const xml = buildRssFeed([post]);
    expect(xml).toContain("<title>Dentures &amp; &lt;implants&gt;</title>");
    expect(xml).toContain("<pubDate>Tue, 29 Sep 2026 00:00:00 GMT</pubDate>");
  });
});
