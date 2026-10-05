import {
  instagramAccount,
  socialPreviewHref,
  type SocialPreviewChannel,
  type SocialPreviewPost,
} from "@/lib/social-preview-model";
import "./social-preview.css";

export function SocialPreview({
  posts,
  postId,
  channel,
  catalogOpen,
}: {
  posts: SocialPreviewPost[];
  postId: string;
  channel: SocialPreviewChannel;
  catalogOpen: boolean;
}) {
  const post = posts.find((item) => item.id === postId) ?? posts[0];

  return (
    <main id="main-content" className={`social-stage social-stage-${channel}`} tabIndex={-1}>
      <div className="social-tools">
        <a
          className="social-tool"
          href={socialPreviewHref({ post: post.id, channel, catalog: !catalogOpen })}
          aria-expanded={catalogOpen}
        >
          Catalog
        </a>
        <div className="social-switch" role="group" aria-label="Channel">
          <a
            href={socialPreviewHref({ post: post.id, channel: "instagram", catalog: catalogOpen })}
            aria-pressed={channel === "instagram"}
          >
            Instagram
          </a>
          <a
            href={socialPreviewHref({ post: post.id, channel: "facebook", catalog: catalogOpen })}
            aria-pressed={channel === "facebook"}
          >
            Facebook
          </a>
        </div>
      </div>

      {catalogOpen ? <Catalog posts={posts} selectedId={post.id} channel={channel} /> : null}

      <div className="social-frame">
        {channel === "instagram" ? <InstagramPost post={post} /> : <FacebookPost post={post} />}
      </div>
    </main>
  );
}

function Catalog({
  posts,
  selectedId,
  channel,
}: {
  posts: SocialPreviewPost[];
  selectedId: string;
  channel: SocialPreviewChannel;
}) {
  const lanes = [
    { id: "organic" as const, title: "Feed" },
    { id: "paid" as const, title: "Ads" },
  ];

  return (
    <aside className="social-catalog" aria-label="Catalog">
      {lanes.map((lane) => (
        <section key={lane.id}>
          <h2>{lane.title}</h2>
          <ul>
            {posts
              .filter((post) => post.lane === lane.id)
              .map((post) => (
                <li key={post.id}>
                  <a
                    href={socialPreviewHref({ post: post.id, channel })}
                    aria-current={post.id === selectedId ? "page" : undefined}
                  >
                    <span>{post.label}</span>
                    <small>
                      {post.format} · {post.video ? "Ready" : "Waiting"}
                    </small>
                  </a>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </aside>
  );
}

function Media({ post }: { post: SocialPreviewPost }) {
  if (!post.video) {
    return (
      <div className="social-waiting">
        <p>{post.onScreen}</p>
        <small>This catalog unit is not rendered yet.</small>
      </div>
    );
  }

  return (
    <video src={post.video} poster={post.poster ?? undefined} autoPlay muted loop playsInline />
  );
}

function InstagramPost({ post }: { post: SocialPreviewPost }) {
  return (
    <article className="ig-post" aria-label={`Instagram post ${post.id}`}>
      <header className="ig-head">
        <span className="ig-avatar" aria-hidden="true">
          <span>r</span>
        </span>
        <div className="ig-id">
          <strong>{instagramAccount}</strong>
          <span className="ig-follow">Follow</span>
        </div>
        <Dots />
      </header>
      <div className="ig-media">
        <Media post={post} />
      </div>
      <div className="ig-actions" aria-hidden="true">
        <span className="ig-action-group">
          <Heart />
          <Comment />
          <Share />
        </span>
        <Bookmark />
      </div>
      <p className="ig-caption">
        <strong>{instagramAccount}</strong> {post.caption}
      </p>
      <a className="ig-link" href={post.instagramHref}>
        {post.ctaLabel}
      </a>
      <p className="ig-audio">
        <span className="ig-disc" aria-hidden="true" />
        Original audio
      </p>
    </article>
  );
}

function FacebookPost({ post }: { post: SocialPreviewPost }) {
  const host = new URL(post.facebookHref).host;

  return (
    <article className="fb-post" aria-label={`Facebook post ${post.id}`}>
      <header className="fb-head">
        <span className="fb-avatar" aria-hidden="true">
          r
        </span>
        <div>
          <strong>Renew Implant Centre</strong>
          <p>
            Just now · <Globe /> Public
          </p>
        </div>
      </header>
      <p className="fb-caption">{post.caption}</p>
      <div className="fb-media">
        <Media post={post} />
      </div>
      <a className="fb-link" href={post.facebookHref}>
        <span>{host.replace(/^www\./, "").toUpperCase()}</span>
        <strong>{post.ctaLabel}</strong>
      </a>
      <footer className="fb-actions" aria-hidden="true">
        <span>Like</span>
        <span>Comment</span>
        <span>Share</span>
      </footer>
    </article>
  );
}

function Heart() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20.2s-6.6-4.1-6.6-8.5a3.7 3.7 0 0 1 6.6-1.8 3.7 3.7 0 0 1 6.6 1.8c0 4.4-6.6 8.5-6.6 8.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function Comment() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.2 17.2 4.4 20v-5.6A7.4 7.4 0 1 1 12 18.4H7.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Share() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M21 4.5 10.2 11.2M21 4.5 14 20.2l-3.8-7.2L21 4.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Bookmark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.2L6 20V5.5a1 1 0 0 1 1-1z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Dots() {
  return (
    <svg className="ig-dots" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="6" cy="12" r="1.4" fill="currentColor" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <circle cx="18" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}

function Globe() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 8h12M8 2c1.8 1.8 2.7 3.8 2.7 6S9.8 12.2 8 14c-1.8-1.8-2.7-3.8-2.7-6S6.2 3.8 8 2z" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
