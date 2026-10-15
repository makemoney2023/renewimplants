import type { MetadataRoute } from "next";
import { QUIZ_PATH } from "@shell/quiz/paths";
import { pages, site } from "@/content/load";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pages.map((page) => ({
      url: `${site.url}${page.path === "/" ? "/" : page.path}`,
      ...(page.modified || page.published ? { lastModified: page.modified || page.published } : {}),
    })),
    { url: `${site.url}${QUIZ_PATH}` },
  ];
}
