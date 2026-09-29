import { getRouteSlugs } from "@/content/routes";
import { getAllPosts } from "./blog";
import { QUIZ_PATH, QUIZ_THANK_YOU_PATH } from "./quiz/constants";

/** Every public URL that belongs in the sitemap, in navigation order. */
export function getIndexablePaths() {
  return [
    "/",
    ...getRouteSlugs().map((slug) => `/${slug}`),
    QUIZ_PATH,
    "/blog",
    ...getAllPosts().map((post) => post.url),
  ];
}

export function isInternalPage(href: string) {
  const path = href.split(/[?#]/)[0];
  return path === QUIZ_THANK_YOU_PATH || getIndexablePaths().includes(path);
}
