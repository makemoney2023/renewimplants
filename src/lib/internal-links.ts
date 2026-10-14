import { getPrimaryNav } from "@/content/nav";
import { getRouteSlugs } from "@/content/routes";
import { getAllPosts, getRelatedPosts, type BlogPost } from "@/lib/blog";
import { HUB_CLUSTERS, pillarHrefFor, postsForHub } from "@/lib/blog-hubs";
import { QUIZ_PATH, QUIZ_THANK_YOU_PATH } from "@/lib/quiz/constants";

export type LinkEdge = {
  from: string;
  to: string;
  anchor: string;
};

const MARKDOWN_LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

export function internalPath(href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) return null;
  const path = href.split("#")[0]?.split("?")[0] ?? href;
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

export function knownInternalPaths(posts = getAllPosts()) {
  return new Set<string>([
    "/",
    "/blog",
    QUIZ_PATH,
    QUIZ_THANK_YOU_PATH,
    ...getRouteSlugs().map((slug) => `/${slug}`),
    ...posts.map((post) => post.url),
  ]);
}

function push(edges: LinkEdge[], from: string, href: string, anchor: string) {
  const to = internalPath(href);
  if (!to) return;
  edges.push({ from, to, anchor });
}

export function markdownLinks(post: BlogPost) {
  return [...post.body.matchAll(MARKDOWN_LINK)].flatMap((match) => {
    const to = internalPath(match[2] ?? "");
    if (!to) return [];
    return [{ anchor: match[1] ?? "", to }];
  });
}

export function buildLinkMap(posts = getAllPosts()) {
  const edges: LinkEdge[] = [];

  for (const post of posts) {
    for (const link of markdownLinks(post)) {
      edges.push({ from: post.url, to: link.to, anchor: link.anchor });
    }
    if (post.body.includes("<BlogCta")) {
      edges.push({ from: post.url, to: QUIZ_PATH, anchor: post.quizCtaLabel });
    }
    for (const related of getRelatedPosts(post.slug)) {
      edges.push({ from: post.url, to: related.url, anchor: related.title });
    }
  }

  for (const slug of Object.keys(HUB_CLUSTERS)) {
    for (const post of postsForHub(slug)) {
      edges.push({ from: `/${slug}`, to: post.url, anchor: post.title });
    }
  }

  for (const item of getPrimaryNav()) {
    push(edges, "/", item.href, item.label);
    for (const child of item.children) push(edges, "/", child.href, child.label);
  }

  return edges;
}

export function inboundCounts(edges: LinkEdge[], posts = getAllPosts()) {
  const counts = new Map(posts.map((post) => [post.url, 0]));
  for (const edge of edges) {
    if (edge.from === edge.to) continue;
    if (!counts.has(edge.to)) continue;
    counts.set(edge.to, (counts.get(edge.to) ?? 0) + 1);
  }
  return counts;
}

export function linkMapSummary(posts = getAllPosts()) {
  const edges = buildLinkMap(posts);
  const known = knownInternalPaths(posts);
  const broken = edges.filter((edge) => !known.has(edge.to));
  const inbound = inboundCounts(edges, posts);
  const orphans = [...inbound.entries()].filter(([, count]) => count === 0).map(([url]) => url);
  const hubEdges = edges.filter((edge) => Object.keys(HUB_CLUSTERS).some((slug) => edge.from === `/${slug}`));
  return {
    posts: posts.length,
    edges: edges.length,
    hubEdges: hubEdges.length,
    broken: broken.length,
    orphans: orphans.length,
    minInbound: Math.min(...inbound.values()),
  };
}

export function bodyBlogLinks(post: BlogPost) {
  return [...new Set(markdownLinks(post).map((link) => link.to).filter((href) => href.startsWith("/blog/")))];
}

export { pillarHrefFor };
