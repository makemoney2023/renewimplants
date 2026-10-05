import { absoluteClickHref, loadAds, loadOrganicPosts, type PublishUnit } from "./social-pipeline";
import type { SocialPreviewPost } from "./social-preview-model";

export type { SocialPreviewPost } from "./social-preview-model";
export { SOCIAL_PREVIEW_PATH, instagramAccount } from "./social-preview-model";

const rendered: Record<string, { video: string; poster: string }> = {
  "w01-tue": {
    video: "/media/social/w01-tue.mp4?v=2",
    poster: "/media/social/w01-tue-poster.jpg?v=2",
  },
  "w07-fri": {
    video: "/media/social/w07-fri.mp4",
    poster: "/media/social/w07-fri-poster.jpg",
  },
};

function facebookPath(unit: PublishUnit) {
  const extra = unit as PublishUnit & { facebookCtaHref?: string };
  return extra.facebookCtaHref ?? unit.ctaHref;
}

function toPost(unit: PublishUnit, lane: "organic" | "paid"): SocialPreviewPost {
  const media = rendered[unit.id];
  const organic = unit as PublishUnit & { week?: number; weekday?: string };
  const label =
    lane === "organic" && organic.week && organic.weekday
      ? `Week ${organic.week} ${organic.weekday}`
      : unit.id;

  return {
    id: unit.id,
    lane,
    format: unit.format,
    label,
    caption: unit.body,
    onScreen: unit.onScreen[0] ?? "",
    ctaLabel: unit.ctaLabel,
    instagramHref: absoluteClickHref(unit.ctaHref),
    facebookHref: absoluteClickHref(facebookPath(unit)),
    video: media?.video ?? null,
    poster: media?.poster ?? null,
  };
}

export function loadSocialPreview(): SocialPreviewPost[] {
  const organic = loadOrganicPosts().map((unit) => toPost(unit, "organic"));
  const paid = loadAds().map((unit) => toPost(unit, "paid"));
  return [...organic, ...paid].sort((a, b) => Number(b.video !== null) - Number(a.video !== null));
}
