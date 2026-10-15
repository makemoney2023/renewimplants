import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostCardList, PostToc } from "@/components/blog/post-chrome";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { JsonLd } from "@/components/json-ld";
import { QuizCta } from "@/components/quiz/quiz-cta";
import { site } from "@/content/site";
import { absoluteUrl, schemaIds } from "@/lib/site-schema";
import { getPost, postCards, posts } from "@clinic/profile/blog";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};

  return {
    title: `${post.title} | ${site.name}`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      images: [{ url: post.image, alt: post.imageAlt }],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const related = postCards.filter((card) => card.slug !== post.slug).slice(0, 3);
  const pageUrl = absoluteUrl(`/blog/${post.slug}`);

  return (
    <main id="main-content" tabIndex={-1} className="content-page blog-post">
      <article>
        <header className="content-hero">
          <div className="content-hero-copy">
            <Breadcrumbs
              crumbs={[
                { name: "Home", path: "/" },
                { name: "Blog", path: "/blog" },
                { name: post.title, path: `/blog/${post.slug}` },
              ]}
            />
            <h1>{post.title}</h1>
            <p>{post.description}</p>
            <div className="post-byline">
              <p>
                By <Link href="/meet-your-dentist">Tom Szarski, DD</Link>
              </p>
              {post.date ? (
                <p>
                  Published <time dateTime={post.date}>{post.date}</time>
                </p>
              ) : null}
            </div>
          </div>
          <div className="content-hero-photo">
            <Image src={post.image} alt={post.imageAlt} fill priority sizes="(max-width: 800px) 100vw, 48vw" />
          </div>
        </header>

        <div className="content-body">
          <div className="content-sections post-body">
            <div className="post-prose" dangerouslySetInnerHTML={{ __html: post.html }} />
          </div>
          <div className="post-aside">
            <PostToc headings={post.headings} />
            <QuizCta source="blog" medium="sticky" campaign="blog-post" />
          </div>
        </div>
        {related.length > 0 ? <PostCardList posts={related} heading="More from the clinic" /> : null}
      </article>
      <footer className="content-footer">
        <Link href="/blog">
          <ArrowLeft aria-hidden="true" />
          All posts
        </Link>
        <p>{site.address}</p>
      </footer>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "@id": `${pageUrl}#post`,
          headline: post.title,
          description: post.description,
          image: post.image,
          ...(post.date ? { datePublished: post.date, dateModified: post.date } : {}),
          author: { "@type": "Person", name: "Tom Szarski", honorificSuffix: "DD", url: absoluteUrl("/meet-your-dentist") },
          publisher: { "@id": schemaIds.practice },
          mainEntityOfPage: pageUrl,
          isPartOf: { "@id": schemaIds.website },
        }}
      />
    </main>
  );
}
