import { getAllPosts, PILLAR_META, type BlogCluster, type BlogPost } from "@/lib/blog";

/** Service and guide pages that should link down into a cluster. */
export const HUB_CLUSTERS: Record<string, readonly BlogCluster[]> = {
  "services/all-on-4-dental-implants": ["all-on-4"],
  "services/full-arch-dental-implants": ["all-on-4"],
  "services/upper-jaw-implants": ["all-on-4"],
  "services/lower-jaw-implants": ["all-on-4"],
  "services/same-day-dental-implants": ["candidacy-recovery"],
  "services/denture-alternative": ["dentures-vs-implants"],
  "services/sedation-dentistry": ["anxiety-sedation"],
  "services/failed-dental-work": ["risks"],
  pricing: ["cost-coverage"],
  "what-to-expect": ["candidacy-recovery"],
  "dental-anxiety": ["anxiety-sedation"],
  faq: ["risks"],
  "contact-us": ["risks"],
};

/** Pillar URL for in-body links. The comparison pillar is itself a post, so that post points at the denture service instead. */
export function pillarHrefFor(post: Pick<BlogPost, "url" | "pillar" | "cluster">) {
  const href = PILLAR_META[post.pillar].href;
  if (href !== post.url) return href;
  if (post.cluster === "dentures-vs-implants") return "/services/denture-alternative";
  return "/services/all-on-4-dental-implants";
}

export function postsForHub(slug: string) {
  const clusters = HUB_CLUSTERS[slug];
  if (!clusters) return [];
  const allowed = new Set(clusters);
  return getAllPosts().filter((post) => allowed.has(post.cluster));
}
