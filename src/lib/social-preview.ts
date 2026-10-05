import { absoluteClickHref, loadAds, loadOrganicPosts, type PublishUnit } from "./social-pipeline";
import type { SocialPreviewPost } from "./social-preview-model";

export type { SocialPreviewPost } from "./social-preview-model";
export { SOCIAL_PREVIEW_PATH, instagramAccount } from "./social-preview-model";

const rendered: Record<string, { video?: string; poster?: string; images?: string[] }> = {
  "w01-tue": {
    video: "/media/social/w01-tue.mp4?v=2",
    poster: "/media/social/w01-tue-poster.jpg?v=2",
  },
  "w01-thu": { images: ["/media/social/w01-thu.jpg"] },
  "w01-fri": {
    video: "/media/social/w01-fri.mp4",
    poster: "/media/social/w01-fri-poster.jpg",
  },
  "w02-tue": {
    video: "/media/social/w02-tue.mp4",
    poster: "/media/social/w02-tue-poster.jpg",
  },
  "w02-thu": { images: ["/media/social/w02-thu.jpg"] },
  "w02-fri": {
    images: [
      "/media/social/w02-fri-1.jpg",
      "/media/social/w02-fri-2.jpg",
      "/media/social/w02-fri-3.jpg",
      "/media/social/w02-fri-4.jpg",
    ],
  },
  "w03-tue": {
    video: "/media/social/w03-tue.mp4",
    poster: "/media/social/w03-tue-poster.jpg",
  },
  "w03-thu": { images: ["/media/social/w03-thu.jpg"] },
  "w03-fri": {
    video: "/media/social/w03-fri.mp4",
    poster: "/media/social/w03-fri-poster.jpg",
  },
  "w07-fri": {
    video: "/media/social/w07-fri.mp4?v=2",
    poster: "/media/social/w07-fri-poster.jpg?v=2",
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
    images: media?.images ?? null,
    week: lane === "organic" ? (organic.week ?? null) : null,
    weekday: lane === "organic" ? (organic.weekday ?? null) : null,
    pillar: unit.pillar,
  };
}

export function loadSocialPreview(): SocialPreviewPost[] {
  const organic = loadOrganicPosts().map((unit) => toPost(unit, "organic"));
  const paid = loadAds().map((unit) => toPost(unit, "paid"));
  return [...organic, ...paid];
}
