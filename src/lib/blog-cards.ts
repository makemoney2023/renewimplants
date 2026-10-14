import type { BlogCluster, BlogPost } from "@/lib/blog";

/** Existing clinic photos. Used when a post has no hero of its own. */
const CLUSTER_IMAGE: Record<BlogCluster, { src: string; alt: string }> = {
  "all-on-4": {
    src: "/media/services/service-allon4.jpg",
    alt: "A clear dental model showing a full arch of teeth supported by four implants",
  },
  "dentures-vs-implants": {
    src: "/media/services/service-snapon.jpg",
    alt: "An implant-retained snap-on denture beside the implants it clips onto",
  },
  "cost-coverage": {
    src: "/media/interiors/renew-lab.jpg",
    alt: "The treatment room at Renew Implant Centre",
  },
  "candidacy-recovery": {
    src: "/media/interiors/renew-lab.jpg",
    alt: "The treatment room at Renew Implant Centre",
  },
  "anxiety-sedation": {
    src: "/media/services/service-sedation.jpg",
    alt: "A patient resting with eyes closed in a dental chair",
  },
  local: {
    src: "/media/heroes/renew-hero.jpg",
    alt: "The Renew Implant Centre operatory",
  },
  risks: {
    src: "/media/services/service-fullarch.jpg",
    alt: "A full arch implant bridge beside a single implant crown",
  },
};

export type PostCardData = {
  slug: string;
  url: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

export function toPostCard(post: Pick<BlogPost, "slug" | "url" | "title" | "description" | "cluster" | "heroImage" | "heroImageAlt">): PostCardData {
  const fallback = CLUSTER_IMAGE[post.cluster];
  return {
    slug: post.slug,
    url: post.url,
    title: post.title,
    description: post.description,
    image: post.heroImage ?? fallback.src,
    imageAlt: post.heroImageAlt ?? fallback.alt,
  };
}
