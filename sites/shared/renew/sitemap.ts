import type { MetadataRoute } from "next";
import { getRouteSlugs } from "@/content/routes";
import { siteOrigin } from "@/lib/site-origin";
import { posts } from "@clinic/profile/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  const paths = [
    "/",
    "/blog",
    "/implant-candidate-quiz",
    ...getRouteSlugs().map((slug) => `/${slug}`),
    ...posts.map((post) => `/blog/${post.slug}`),
  ];

  return [...new Set(paths)].map((path) => ({
    url: path === "/" ? `${origin}/` : `${origin}${path}`,
  }));
}
