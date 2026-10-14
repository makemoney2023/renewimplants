import { approvalStatus, decisionsToMap, type ApprovalRecord, type ApprovalStatus } from "@/lib/social-approval";
import {
  filterSocialPosts,
  instagramAccount,
  LIBRARY_PILLARS,
  postIsReady,
  socialPreviewHref,
  sortSocialPosts,
  type LibraryPillar,
  type LibraryQuery,
  type SocialPreviewChannel,
  type SocialPreviewPost,
} from "@/lib/social-preview-model";
import "./social-preview.css";

const PILLAR_LABELS: Record<LibraryPillar, string> = {
  "clinical-demystification": "Clinical",
  "social-proof": "Reviews",
  "practice-culture": "Practice",
  "patient-education": "Education",
};

export function SocialPreview({
  posts,
  postId,
  channel,
  catalogOpen,
  view,
  library,
  decisions,
}: {
  posts: SocialPreviewPost[];
  postId: string;
  channel: SocialPreviewChannel;
  catalogOpen: boolean;
  view: "post" | "library";
  library: LibraryQuery;
  decisions: ApprovalRecord[];
}) {
  const post = posts.find((item) => item.id === postId) ?? posts[0];
  const libraryHref = socialPreviewHref({ view: "library", channel, library });
  const decisionMap = decisionsToMap(decisions);
  const returnTo = socialPreviewHref({
    post: post.id,
    channel,
    catalog: view === "post" && catalogOpen,
    view,
    library,
  });

  return (
    <main id="main-content" className={`social-stage social-stage-${channel}`} tabIndex={-1}>
      <div className="social-tools">
        <div className="social-tool-group">
          <a className="social-tool" href={libraryHref} aria-pressed={view === "library"}>
            Library
          </a>
          {view === "post" ? (
            <a
              className="social-tool"
              href={socialPreviewHref({ post: post.id, channel, catalog: !catalogOpen, library })}
              aria-expanded={catalogOpen}
            >
              Catalog
            </a>
          ) : null}
        </div>
        <div className="social-switch" role="group" aria-label="Channel">
          <a
            href={socialPreviewHref({
              post: post.id,
              channel: "instagram",
              catalog: view === "post" && catalogOpen,
              view,
              library,
            })}
            aria-pressed={channel === "instagram"}
          >
            Instagram
          </a>
          <a
            href={socialPreviewHref({
              post: post.id,
              channel: "facebook",
              catalog: view === "post" && catalogOpen,
              view,
              library,
            })}
            aria-pressed={channel === "facebook"}
          >
            Facebook
          </a>
        </div>
      </div>

      {view === "library" ? (
        <Library posts={posts} channel={channel} library={library} decisions={decisionMap} returnTo={returnTo} />
      ) : (
        <>
          {catalogOpen ? (
            <Catalog
              posts={posts}
              selectedId={post.id}
              channel={channel}
              library={library}
              decisions={decisionMap}
              returnTo={returnTo}
            />
          ) : null}
          <div className="social-frame">
            <div className="social-review">
              <ApprovalControls id={post.id} tone="light" status={approvalStatus(decisions, post.id)} returnTo={returnTo} />
              <p>Approved units join the post queue. This page does not publish.</p>
            </div>
            {channel === "instagram" ? <InstagramPost post={post} /> : <FacebookPost post={post} />}
          </div>
        </>
      )}
    </main>
  );
}

function Library({
  posts,
  channel,
  library,
  decisions,
  returnTo,
}: {
  posts: SocialPreviewPost[];
  channel: SocialPreviewChannel;
  library: LibraryQuery;
  decisions: Map<string, "approved" | "not-approved">;
  returnTo: string;
}) {
  const visible = sortSocialPosts(filterSocialPosts(posts, library, decisions), library.sort);
  const ready = visible.filter((post) => postIsReady(post)).length;
  const approved = visible.filter((post) => decisions.get(post.id) === "approved").length;
  const filtered =
    library.lane !== "all" ||
    library.format !== "all" ||
    library.state !== "all" ||
    library.approval !== "all" ||
    library.pillar !== "all" ||
    library.week !== "all" ||
    library.sort !== "catalog" ||
    library.q !== "";

  return (
    <div className="library">
      <form className="library-filters" action="/social-preview" method="get">
        <input type="hidden" name="view" value="library" />
        {channel === "facebook" ? <input type="hidden" name="channel" value="facebook" /> : null}
        <label>
          Lane
          <select name="lane" defaultValue={library.lane}>
            <option value="all">All</option>
            <option value="organic">Feed</option>
            <option value="paid">Ads</option>
          </select>
        </label>
        <label>
          Format
          <select name="format" defaultValue={library.format}>
            <option value="all">All</option>
            <option value="video">Video</option>
            <option value="static">Static</option>
            <option value="carousel">Carousel</option>
          </select>
        </label>
        <label>
          State
          <select name="state" defaultValue={library.state}>
            <option value="all">All</option>
            <option value="ready">Ready</option>
            <option value="waiting">Waiting</option>
          </select>
        </label>
        <label>
          Approval
          <select name="approval" defaultValue={library.approval}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="not-approved">Not approved</option>
          </select>
        </label>
        <label>
          Pillar
          <select name="pillar" defaultValue={library.pillar}>
            <option value="all">All</option>
            {LIBRARY_PILLARS.map((pillar) => (
              <option key={pillar} value={pillar}>
                {PILLAR_LABELS[pillar]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Week
          <select name="week" defaultValue={library.week}>
            <option value="all">All</option>
            <option value="ads">Ads</option>
            {Array.from({ length: 10 }, (_, index) => String(index + 1)).map((week) => (
              <option key={week} value={week}>
                Week {week}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select name="sort" defaultValue={library.sort}>
            <option value="catalog">Catalog</option>
            <option value="week">Week</option>
            <option value="ready">Ready first</option>
            <option value="format">Format</option>
            <option value="name">Name</option>
          </select>
        </label>
        <label className="library-search">
          Search
          <input name="q" type="search" defaultValue={library.q} maxLength={80} placeholder="Scan, quiz, mill…" />
        </label>
        <button type="submit">Apply</button>
        {filtered ? (
          <a className="library-clear" href={socialPreviewHref({ view: "library", channel })}>
            Clear
          </a>
        ) : null}
      </form>

      <p className="library-count">
        {visible.length} of {posts.length} · {ready} ready · {approved} approved
      </p>

      {visible.length === 0 ? (
        <p className="library-empty">No assets match these filters.</p>
      ) : (
        <ul className="library-grid">
          {visible.map((post) => {
            const status = decisions.get(post.id) ?? "pending";
            return (
              <li key={post.id}>
                <a className="library-card" href={socialPreviewHref({ post: post.id, channel, library })}>
                  <Thumb post={post} />
                  <span className="library-meta">
                    <span className="library-badges">
                      <span>{post.format}</span>
                      <span>{post.lane === "paid" ? "Ad" : "Feed"}</span>
                      <span>{postIsReady(post) ? "Ready" : "Waiting"}</span>
                      <span className={`approval-badge approval-badge-${status}`}>
                        {status === "approved" ? "Approved" : status === "not-approved" ? "Not approved" : "Pending"}
                      </span>
                      {post.images && post.images.length > 1 ? <span>{post.images.length} slides</span> : null}
                    </span>
                    <strong>{post.label}</strong>
                    <span className="library-line">{post.onScreen}</span>
                  </span>
                </a>
                <ApprovalControls id={post.id} tone="light" status={status} returnTo={returnTo} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ApprovalControls({
  id,
  tone,
  status,
  returnTo,
}: {
  id: string;
  tone: "dark" | "light";
  status: ApprovalStatus;
  returnTo: string;
}) {
  return (
    <form
      className={`approval-controls approval-controls-${tone}`}
      action="/api/social-approvals"
      method="post"
      aria-label={`Approval for ${id}`}
      data-decision={status}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="redirect" value={returnTo} />
      <button
        type="submit"
        className="approval-approve"
        name="decision"
        value={status === "approved" ? "pending" : "approved"}
        aria-pressed={status === "approved"}
      >
        Approve
      </button>
      <button
        type="submit"
        className="approval-hold"
        name="decision"
        value={status === "not-approved" ? "pending" : "not-approved"}
        aria-pressed={status === "not-approved"}
      >
        Not approved
      </button>
    </form>
  );
}

function Thumb({ post }: { post: SocialPreviewPost }) {
  const src = post.poster ?? post.images?.[0] ?? null;
  if (!src) {
    return (
      <span className="library-thumb library-thumb-waiting">
        <span>{post.onScreen}</span>
      </span>
    );
  }

  return (
    <span className={`library-thumb library-thumb-${post.format}`}>
      <img src={src} alt="" />
    </span>
  );
}

function Catalog({
  posts,
  selectedId,
  channel,
  library,
  decisions,
  returnTo,
}: {
  posts: SocialPreviewPost[];
  selectedId: string;
  channel: SocialPreviewChannel;
  library: LibraryQuery;
  decisions: Map<string, "approved" | "not-approved">;
  returnTo: string;
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
              .toSorted((a, b) => Number(postIsReady(b)) - Number(postIsReady(a)))
              .map((post) => (
                <li key={post.id} className="catalog-item">
                  <a
                    href={socialPreviewHref({ post: post.id, channel, library })}
                    aria-current={post.id === selectedId ? "page" : undefined}
                  >
                    <span>{post.label}</span>
                    <small>
                      {post.format} · {post.video || post.images?.length ? "Ready" : "Waiting"}
                    </small>
                  </a>
                  <ApprovalControls
                    id={post.id}
                    tone="dark"
                    status={decisions.get(post.id) ?? "pending"}
                    returnTo={returnTo}
                  />
                </li>
              ))}
          </ul>
        </section>
      ))}
    </aside>
  );
}

function Media({ post }: { post: SocialPreviewPost }) {
  if (post.video) {
    return (
      <video src={post.video} poster={post.poster ?? undefined} autoPlay muted loop playsInline />
    );
  }

  if (post.images && post.images.length > 1) {
    return (
      <div className="feed-carousel">
        <div className="feed-slides" tabIndex={0}>
          {post.images.map((src) => (
            <img key={src} src={src} alt="" />
          ))}
        </div>
        <div className="feed-dots" aria-hidden="true">
          {post.images.map((src) => (
            <span key={src} />
          ))}
        </div>
      </div>
    );
  }

  if (post.images?.length === 1) {
    return <img className="feed-still" src={post.images[0]} alt="" />;
  }

  return (
    <div className="social-waiting">
      <p>{post.onScreen}</p>
      <small>This catalog unit is not rendered yet.</small>
    </div>
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
      {post.video ? (
        <p className="ig-audio">
          <span className="ig-disc" aria-hidden="true" />
          Original audio
        </p>
      ) : null}
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
