export const SOCIAL_PREVIEW_PATH = "/social-preview";

export const instagramAccount = "renewimplants";

export type SocialPreviewChannel = "instagram" | "facebook";

export type SocialPreviewPost = {
  id: string;
  lane: "organic" | "paid";
  format: "video" | "static" | "carousel";
  label: string;
  caption: string;
  onScreen: string;
  ctaLabel: string;
  instagramHref: string;
  facebookHref: string;
  video: string | null;
  poster: string | null;
  images: string[] | null;
  week: number | null;
  weekday: string | null;
  pillar: LibraryPillar;
};

export const LIBRARY_PILLARS = [
  "clinical-demystification",
  "social-proof",
  "practice-culture",
  "patient-education",
] as const;

export type LibraryPillar = (typeof LIBRARY_PILLARS)[number];
export type LibraryLane = "all" | "organic" | "paid";
export type LibraryFormat = "all" | SocialPreviewPost["format"];
export type LibraryState = "all" | "ready" | "waiting";
export type LibraryApproval = "all" | "pending" | "approved" | "not-approved";
export type LibraryWeek = "all" | "ads" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10";
export type LibrarySort = "catalog" | "week" | "ready" | "format" | "name";

export type LibraryQuery = {
  lane: LibraryLane;
  format: LibraryFormat;
  state: LibraryState;
  approval: LibraryApproval;
  pillar: "all" | LibraryPillar;
  week: LibraryWeek;
  sort: LibrarySort;
  q: string;
};

export const defaultLibraryQuery: LibraryQuery = {
  lane: "all",
  format: "all",
  state: "all",
  approval: "all",
  pillar: "all",
  week: "all",
  sort: "catalog",
  q: "",
};

const WEEKDAYS = ["tue", "thu", "fri"];
const FORMATS: SocialPreviewPost["format"][] = ["video", "static", "carousel"];

export function postIsReady(post: { video: string | null; images: string[] | null }) {
  return post.video !== null || (post.images?.length ?? 0) > 0;
}

function oneOf<T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T {
  return value && allowed.includes(value as T) ? (value as T) : fallback;
}

export function parseLibraryQuery(input: {
  lane?: string;
  format?: string;
  state?: string;
  approval?: string;
  pillar?: string;
  week?: string;
  sort?: string;
  q?: string;
}): LibraryQuery {
  return {
    lane: oneOf(input.lane, ["all", "organic", "paid"] as const, "all"),
    format: oneOf(input.format, ["all", "video", "static", "carousel"] as const, "all"),
    state: oneOf(input.state, ["all", "ready", "waiting"] as const, "all"),
    approval: oneOf(input.approval, ["all", "pending", "approved", "not-approved"] as const, "all"),
    pillar: oneOf(input.pillar, ["all", ...LIBRARY_PILLARS] as const, "all"),
    week: oneOf(input.week, ["all", "ads", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const, "all"),
    sort: oneOf(input.sort, ["catalog", "week", "ready", "format", "name"] as const, "catalog"),
    q: (input.q ?? "").trim().slice(0, 80),
  };
}

export function filterSocialPosts(
  posts: SocialPreviewPost[],
  query: LibraryQuery,
  decisions: ReadonlyMap<string, "approved" | "not-approved"> = new Map(),
) {
  const needle = query.q.toLowerCase();
  return posts.filter((post) => {
    if (query.lane !== "all" && post.lane !== query.lane) return false;
    if (query.format !== "all" && post.format !== query.format) return false;
    if (query.state === "ready" && !postIsReady(post)) return false;
    if (query.state === "waiting" && postIsReady(post)) return false;
    if (query.approval !== "all" && (decisions.get(post.id) ?? "pending") !== query.approval) return false;
    if (query.pillar !== "all" && post.pillar !== query.pillar) return false;
    if (query.week === "ads" && post.week !== null) return false;
    if (query.week !== "all" && query.week !== "ads" && post.week !== Number(query.week)) return false;
    if (!needle) return true;
    const haystack = `${post.id} ${post.label} ${post.onScreen} ${post.caption}`.toLowerCase();
    return haystack.includes(needle);
  });
}

export function sortSocialPosts(posts: SocialPreviewPost[], sort: LibrarySort) {
  if (sort === "catalog") return posts;
  const ranked = posts.map((post, index) => ({ post, index }));
  ranked.sort((a, b) => {
    const by = comparePosts(a.post, b.post, sort);
    return by === 0 ? a.index - b.index : by;
  });
  return ranked.map((item) => item.post);
}

function comparePosts(a: SocialPreviewPost, b: SocialPreviewPost, sort: LibrarySort) {
  if (sort === "name") return a.label.localeCompare(b.label) || a.id.localeCompare(b.id);
  if (sort === "format") return FORMATS.indexOf(a.format) - FORMATS.indexOf(b.format) || a.label.localeCompare(b.label);
  if (sort === "ready") return Number(postIsReady(b)) - Number(postIsReady(a)) || a.label.localeCompare(b.label);
  const weekA = a.week ?? 0;
  const weekB = b.week ?? 0;
  return weekB - weekA || WEEKDAYS.indexOf(a.weekday ?? "") - WEEKDAYS.indexOf(b.weekday ?? "") || a.id.localeCompare(b.id);
}

function appendLibrary(params: URLSearchParams, library?: Partial<LibraryQuery>) {
  if (!library) return;
  if (library.lane && library.lane !== "all") params.set("lane", library.lane);
  if (library.format && library.format !== "all") params.set("format", library.format);
  if (library.state && library.state !== "all") params.set("state", library.state);
  if (library.approval && library.approval !== "all") params.set("approval", library.approval);
  if (library.pillar && library.pillar !== "all") params.set("pillar", library.pillar);
  if (library.week && library.week !== "all") params.set("week", library.week);
  if (library.sort && library.sort !== "catalog") params.set("sort", library.sort);
  if (library.q) params.set("q", library.q);
}

export function socialPreviewHref({
  post = "w01-tue",
  channel = "instagram",
  catalog = false,
  view = "post",
  library,
}: {
  post?: string;
  channel?: SocialPreviewChannel;
  catalog?: boolean;
  view?: "post" | "library";
  library?: Partial<LibraryQuery>;
} = {}) {
  const params = new URLSearchParams();
  if (view === "library") params.set("view", "library");
  else if (post !== "w01-tue") params.set("post", post);
  if (channel === "facebook") params.set("channel", "facebook");
  if (view === "post" && catalog) params.set("catalog", "1");
  appendLibrary(params, library);
  const query = params.toString();
  return query ? `${SOCIAL_PREVIEW_PATH}?${query}` : SOCIAL_PREVIEW_PATH;
}
