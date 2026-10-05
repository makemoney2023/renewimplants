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
};

export function socialPreviewHref({
  post = "w01-tue",
  channel = "instagram",
  catalog = false,
}: {
  post?: string;
  channel?: SocialPreviewChannel;
  catalog?: boolean;
} = {}) {
  const params = new URLSearchParams();
  if (post !== "w01-tue") params.set("post", post);
  if (channel === "facebook") params.set("channel", "facebook");
  if (catalog) params.set("catalog", "1");
  const query = params.toString();
  return query ? `${SOCIAL_PREVIEW_PATH}?${query}` : SOCIAL_PREVIEW_PATH;
}
