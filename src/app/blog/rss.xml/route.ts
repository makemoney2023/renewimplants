import { getAllPosts } from "@/lib/blog";
import { buildRssFeed } from "@/lib/blog-rss";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildRssFeed(getAllPosts()), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
