import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostCardList } from "@/components/blog/post-chrome";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { QuizCta } from "@/components/quiz/quiz-cta";
import { site } from "@/content/site";
import { getAllPosts } from "@/lib/blog";
import { toPostCard } from "@/lib/blog-cards";
import { BLOG_NAME, buildBlogIndexGraph } from "@/lib/blog-schema";

const description =
  "Straight answers about All-on-4, dentures, and same-day implants from the Orléans team that designs and builds your teeth in its own lab.";

// Temporary until the final blog-index photograph and alt text replace this file.
const blogIndexHero = {
  src: "/media/blog/blog-index-hero.jpg",
  width: 1280,
  height: 720,
  alt: "Placeholder for the Renew Implant Centre blog header.",
};

const ogImage = {
  url: blogIndexHero.src,
  width: blogIndexHero.width,
  height: blogIndexHero.height,
  alt: blogIndexHero.alt,
};

export const metadata: Metadata = {
  title: `Blog | ${site.name}`,
  description,
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: {
    title: BLOG_NAME,
    description,
    url: "/blog",
    type: "website",
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: BLOG_NAME,
    description,
    images: [ogImage],
  },
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main id="main-content" tabIndex={-1} className="content-page blog-index">
      <section className="content-hero blog-index-hero">
        <div className="content-hero-copy">
          <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]} />
          <h1>Implant questions, answered plainly.</h1>
          <p>{description}</p>
        </div>
        <div className="content-hero-photo">
          <Image
            src={blogIndexHero.src}
            alt={blogIndexHero.alt}
            width={blogIndexHero.width}
            height={blogIndexHero.height}
            priority
            loading="eager"
            sizes="(max-width: 800px) 100vw, 46vw"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </section>

      <section className="content-body">
        <PostCardList posts={posts.map(toPostCard)} />
        <div className="post-aside">
          <QuizCta source="blog" medium="sticky" campaign="blog-index" />
        </div>
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
