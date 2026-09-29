import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostCardList } from "@/components/blog/post-chrome";
import { JsonLd } from "@/components/json-ld";
import { QuizCta } from "@/components/quiz/quiz-cta";
import { site } from "@/content/site";
import { getAllPosts } from "@/lib/blog";
import { BLOG_NAME, buildBlogIndexGraph } from "@/lib/blog-schema";

const description =
  "Straight answers about All-on-4, dentures, and same-day implants from the Orléans team that designs and builds your teeth in its own lab.";

export const metadata: Metadata = {
  title: `Blog | ${site.name}`,
  description,
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: { title: BLOG_NAME, description, url: "/blog", type: "website" },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="content-page blog-index">
      <section className="content-hero blog-index-hero">
        <div className="content-hero-copy">
          <p className="section-label">Blog</p>
          <h1>Implant questions, answered plainly.</h1>
          <p>{description}</p>
        </div>
      </section>

      <section className="content-body">
        <PostCardList posts={posts} />
        <aside className="post-aside">
          <QuizCta source="blog" medium="sticky" campaign="blog-index" />
        </aside>
      </section>

      <footer className="content-footer">
        <Link href="/">
          <ArrowLeft aria-hidden="true" />
          Back to home
        </Link>
        <p>{site.address}</p>
      </footer>
      <JsonLd data={buildBlogIndexGraph(posts)} />
    </main>
  );
}
