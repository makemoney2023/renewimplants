import type { BlogPost } from "./blog";
import {
  absoluteUrl,
  buildBreadcrumbNode,
  buildFaqNode,
  schemaIds,
} from "./site-schema";

const personIds = { "tom-szarski": schemaIds.tom } as const;

export const BLOG_NAME = "Renew Implants Blog";

export function buildBlogPostGraph(post: BlogPost) {
  const url = absoluteUrl(post.url);
  const image = post.heroImage ? absoluteUrl(post.heroImage) : undefined;

  const page: Record<string, unknown> = {
    "@type": "MedicalWebPage",
    "@id": `${url}#page`,
    url,
    name: post.title,
    description: post.description,
    inLanguage: "en-CA",
    isPartOf: { "@id": schemaIds.website },
    breadcrumb: { "@id": `${url}#breadcrumb` },
    ...(image ? { primaryImageOfPage: image } : {}),
    ...(post.reviewedBy && post.lastReviewed
      ? { reviewedBy: { "@id": personIds[post.reviewedBy] }, lastReviewed: post.lastReviewed }
      : {}),
  };

  const article: Record<string, unknown> = {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    author: { "@id": personIds[post.author] },
    publisher: { "@id": schemaIds.practice },
    mainEntityOfPage: { "@id": `${url}#page` },
    ...(image ? { image } : {}),
  };

  const faqs = post.faqs.map((faq) => ({ question: faq.q, answer: faq.a }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      page,
      article,
      buildBreadcrumbNode(url, [
        { name: "Blog", path: "/blog" },
        { name: post.title, path: post.url },
      ]),
      buildFaqNode(url, faqs),
    ].filter(Boolean),
  };
}

export function buildBlogIndexGraph(posts: BlogPost[]) {
  const url = absoluteUrl("/blog");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${url}#blog`,
        name: BLOG_NAME,
        url,
        publisher: { "@id": schemaIds.practice },
        blogPost: posts.map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          url: absoluteUrl(post.url),
          datePublished: post.datePublished,
          dateModified: post.dateModified,
          ...(post.heroImage ? { image: absoluteUrl(post.heroImage) } : {}),
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${url}#itemlist`,
        itemListElement: posts.map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(post.url),
          name: post.title,
        })),
      },
      buildBreadcrumbNode(url, [{ name: "Blog", path: "/blog" }]),
    ],
  };
}
