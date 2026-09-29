import { describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { getAllPosts, type BlogPost } from "./blog";
import { buildBlogIndexGraph, buildBlogPostGraph } from "./blog-schema";
import { schemaIds } from "./site-schema";

type Node = Record<string, unknown>;
const byType = (graph: Node[], type: string) => graph.find((node) => node["@type"] === type);

const post = getAllPosts()[0];
const url = `${site.url}${post.url}`;

describe("buildBlogPostGraph", () => {
  const graph = buildBlogPostGraph(post)["@graph"] as Node[];

  it("describes the article with a Person author and the practice as publisher", () => {
    expect(byType(graph, "BlogPosting")).toMatchObject({
      "@id": `${url}#article`,
      headline: post.title,
      description: post.description,
      datePublished: post.datePublished,
      dateModified: post.dateModified,
      author: { "@id": schemaIds.tom },
      publisher: { "@id": schemaIds.practice },
      mainEntityOfPage: { "@id": `${url}#page` },
      image: `${site.url}${post.heroImage}`,
    });
  });

  it("wraps it in a medical web page with breadcrumbs Home > Blog > post", () => {
    expect(byType(graph, "MedicalWebPage")).toMatchObject({ "@id": `${url}#page`, url });
    expect(byType(graph, "BreadcrumbList")).toMatchObject({
      itemListElement: [
        { position: 1, item: `${site.url}/` },
        { position: 2, name: "Blog", item: `${site.url}/blog` },
        { position: 3, name: post.title, item: url },
      ],
    });
  });

  it("emits every visible FAQ as FAQPage markup", () => {
    const faq = byType(graph, "FAQPage") as { mainEntity: { name: string }[] };
    expect(faq.mainEntity.map((entry) => entry.name)).toEqual(post.faqs.map((entry) => entry.q));
  });

  it("claims a clinical reviewer only when the post names one", () => {
    const page = byType(graph, "MedicalWebPage") as Node;
    expect(page.reviewedBy).toBeUndefined();
    expect(page.lastReviewed).toBeUndefined();

    const reviewed: BlogPost = { ...post, reviewedBy: "tom-szarski", lastReviewed: "2026-10-01" };
    const reviewedPage = byType(buildBlogPostGraph(reviewed)["@graph"] as Node[], "MedicalWebPage");
    expect(reviewedPage).toMatchObject({ reviewedBy: { "@id": schemaIds.tom }, lastReviewed: "2026-10-01" });
  });
});

describe("buildBlogIndexGraph", () => {
  it("lists every post as a BlogPosting and an ordered ItemList", () => {
    const posts = getAllPosts();
    const graph = buildBlogIndexGraph(posts)["@graph"] as Node[];
    const blog = byType(graph, "Blog") as { blogPost: unknown[] };
    expect(blog.blogPost).toHaveLength(posts.length);
    expect(byType(graph, "ItemList")).toMatchObject({
      itemListElement: posts.map((entry, index) => ({ position: index + 1, url: `${site.url}${entry.url}` })),
    });
    expect(byType(graph, "BreadcrumbList")).toBeDefined();
  });
});
