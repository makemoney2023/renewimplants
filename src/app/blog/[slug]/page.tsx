import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AuthorByline, PostCardList, PostToc } from "@/components/blog/post-chrome";
import { renderPostBody } from "@/components/blog/render-post-body";
import { FaqList } from "@/components/faq-list";
import { JsonLd } from "@/components/json-ld";
import { QuizCta } from "@/components/quiz/quiz-cta";
import { authors } from "@/content/authors";
import { site } from "@/content/site";
import { getAllPosts, getPost, getRelatedPosts } from "@/lib/blog";
import { buildBlogPostGraph } from "@/lib/blog-schema";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};

  return {
    title: `${post.title} | ${site.name}`,
    description: post.description,
    alternates: { canonical: post.url },
    authors: [{ name: authors[post.author].name, url: authors[post.author].profilePath }],
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: post.url,
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified,
      authors: [authors[post.author].name],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const body = await renderPostBody(post);

  return (
    <main id="main-content" tabIndex={-1} className="content-page blog-post">
      <article>
        <header className="content-hero">
          <div className="content-hero-copy">
            <p className="section-label">
              <Link href="/blog">Blog</Link>
            </p>
            <h1>{post.title}</h1>
            <p>{post.description}</p>
            <AuthorByline post={post} />
          </div>
          {post.heroImage ? (
            <div className="content-hero-photo">
              <Image
                src={post.heroImage}
                alt={post.heroImageAlt ?? ""}
                fill
                priority
                sizes="(max-width: 800px) 100vw, 48vw"
              />
            </div>
          ) : null}
        </header>

        <div className="content-body">
          <div className="content-sections post-body">
            <div className="post-prose">{body}</div>
            <FaqList
              faqs={post.faqs.map((faq) => ({ question: faq.q, answer: faq.a }))}
              heading="Frequently asked questions"
            />
          </div>
          <div className="post-aside">
            <PostToc headings={post.headings} />
            <QuizCta source="blog" medium="sticky" campaign={post.slug} label={post.quizCtaLabel} />
          </div>
        </div>
      </article>

      <div className="post-related">
        <PostCardList posts={getRelatedPosts(post.slug)} heading="Keep reading" />
      </div>

      <footer className="content-footer">
        <Link href="/blog">
          <ArrowLeft aria-hidden="true" />
          All articles
        </Link>
        <p>{site.address}</p>
      </footer>
      <JsonLd data={buildBlogPostGraph(post)} />
    </main>
  );
}
