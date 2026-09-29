import Link from "next/link";
import { authors } from "@/content/authors";
import type { BlogHeading, BlogPost } from "@/lib/blog";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-CA", { dateStyle: "long", timeZone: "UTC" }).format(new Date(date));

export function AuthorByline({ post }: { post: BlogPost }) {
  const author = authors[post.author];
  const reviewer = post.reviewedBy ? authors[post.reviewedBy] : undefined;

  return (
    <div className="post-byline">
      <p>
        By{" "}
        <Link href={author.profilePath}>
          {author.name}, {author.credential}
        </Link>{" "}
        · {author.role}
      </p>
      <p>
        Updated <time dateTime={post.dateModified}>{formatDate(post.dateModified)}</time> ·{" "}
        {post.readingMinutes} min read
      </p>
      {reviewer && post.lastReviewed ? (
        <p>
          Clinically reviewed by {reviewer.name}, {reviewer.credential} on{" "}
          <time dateTime={post.lastReviewed}>{formatDate(post.lastReviewed)}</time>
        </p>
      ) : null}
    </div>
  );
}

export function PostToc({ headings }: { headings: BlogHeading[] }) {
  if (headings.length === 0) return null;

  return (
    <nav className="post-toc" aria-label="On this page">
      <p className="section-label">On this page</p>
      <ol>
        {headings.map((heading) => (
          <li key={heading.id}>
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PostCardList({ posts, heading }: { posts: BlogPost[]; heading?: string }) {
  if (posts.length === 0) return null;

  return (
    <section className="post-cards" aria-label={heading ?? "Articles"}>
      {heading ? <h2>{heading}</h2> : null}
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={post.url}>
              <strong>{post.title}</strong>
              <span>{post.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
