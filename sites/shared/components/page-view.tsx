import Link from "next/link";
import { catalog, site } from "@/content/load";
import { mediaUrl } from "@shell/lib/media";
import type { ClinicPage } from "@shell/types";
import { showsQuizCta } from "@shell/quiz/paths";
import { Breadcrumbs } from "./breadcrumbs";
import { Blocks, h1Class, Hours, Video } from "./blocks";
import { QuizCta } from "./quiz/quiz-cta";

export function PageView({ page }: { page: ClinicPage }) {
  const crumbs = catalog.crumbs(page);
  const roster = catalog.teamPages();
  const showRoster = roster.length > 0 && page.path === "/meet-the-denturists/";
  const posts = page.kind === "blog-index" || page.kind === "post" ? catalog.posts() : [];

  return (
    <main id="main-content" className="content-page" tabIndex={-1}>
      <header className="content-hero">
        <div className="content-hero-copy">
          <Breadcrumbs crumbs={crumbs} />
          <p className="section-label">{site.shortName}</p>
          <h1 className={h1Class(page.h1)}>{page.h1}</h1>
          {page.description ? <p>{page.description}</p> : null}
        </div>
        {page.hero ? (
          <div className="content-hero-photo">
            <img src={mediaUrl(page.hero)} alt="" />
          </div>
        ) : null}
      </header>
      <div className="content-body">
        <article className="prose">
          {showsQuizCta(page.path) ? (
            <QuizCta
              source="implants"
              medium="page"
              campaign="implants"
              intro="Nine questions about your teeth, comfort, and timing. Then a next step from this clinic."
            />
          ) : null}
          {page.video ? <Video src={page.video} /> : null}
          {page.kind === "post" && page.published ? (
            <p className="section-label">
              <time dateTime={page.published}>{page.published}</time>
            </p>
          ) : null}
          <Blocks site={site} page={page} blocks={page.blocks} />
          {showRoster ? (
            <ul className="team-grid">
              {roster.map((member) => (
                <li key={member.path}>
                  <Link className="team-card" href={member.path}>
                    {member.hero ? <img src={mediaUrl(member.hero)} alt="" /> : null}
                    <strong>{member.h1 || member.title}</strong>
                    {member.description ? <span>{member.description}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          {page.kind === "blog-index" ? <PostList posts={posts} /> : null}
          {page.kind === "post" ? (
            <PostList posts={posts.filter((post) => post.path !== page.path)} heading="More from the blog" />
          ) : null}
        </article>
        <aside className="page-aside">
          <div className="aside-card">
            <h2>Visit</h2>
            <p>
              <a href={site.mapHref}>{site.address.label}</a>
            </p>
            <p>
              <a href={site.phone.href}>{site.phone.label}</a>
            </p>
            <p>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
            <Hours rows={site.hours} />
          </div>
        </aside>
      </div>
    </main>
  );
}

function PostList({ posts, heading }: { posts: ClinicPage[]; heading?: string }) {
  if (posts.length === 0) return null;
  return (
    <section className="post-cards">
      {heading ? <h2>{heading}</h2> : null}
      <ul>
        {posts.map((post) => (
          <li key={post.path}>
            <Link href={post.path}>
              {post.hero ? (
                <span className="post-card-photo">
                  <img src={mediaUrl(post.hero)} alt="" />
                </span>
              ) : null}
              <strong>{post.title}</strong>
              {post.description ? <span>{post.description}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
