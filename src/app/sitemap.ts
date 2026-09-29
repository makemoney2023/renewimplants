import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getAllPosts } from "@/lib/blog";
import { getIndexablePaths } from "@/lib/site-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const postDates = new Map(getAllPosts().map((post) => [post.url, post.dateModified]));

  return getIndexablePaths().map((path) => ({
    url: `${site.url}${path}`,
    ...(postDates.has(path) ? { lastModified: postDates.get(path) } : {}),
  }));
}
