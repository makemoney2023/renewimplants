import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostCardList } from "@/components/blog/post-chrome";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { QuizCta } from "@/components/quiz/quiz-cta";
import { blogHero, blogIntro, blogTitle, site } from "@/content/site";
import { absoluteUrl, schemaIds } from "@/lib/site-schema";
import { postCards } from "@clinic/profile/blog";

export const metadata: Metadata = {
  title: `${blogTitle} | ${site.name}`,
  description: blogIntro,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: blogTitle,
    description: blogIntro,
    url: "/blog",
    images: [{ url: blogHero.src, alt: blogHero.alt }],
  },
};

export default function BlogIndexPage() {
  const pageUrl = absoluteUrl("/blog");

  return (
    <main id="main-content" tabIndex={-1} className="content-page blog-index">
      <section className="content-hero">
        <div className="content-hero-copy">
          <Breadcrumbs crumbs={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]} />
          <h1>{blogTitle}</h1>
          <p>{blogIntro}</p>
        </div>
        <div className="content-hero-photo">
          <Image src={blogHero.src} alt={blogHero.alt} fill priority sizes="(max-width: 800px) 100vw, 48vw" />
        </div>
      </section>

      <section className="content-body">
        <PostCardList posts={postCards} />
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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${pageUrl}#page`,
          url: pageUrl,
          name: blogTitle,
          description: blogIntro,
          isPartOf: { "@id": schemaIds.website },
        }}
      />
    </main>
  );
}
