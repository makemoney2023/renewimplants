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
  "w04-tue": {
    images: [
      "/media/social/w04-tue-1.jpg",
      "/media/social/w04-tue-2.jpg",
      "/media/social/w04-tue-3.jpg",
      "/media/social/w04-tue-4.jpg",
    ],
  },
  "w04-thu": { images: ["/media/social/w04-thu.jpg"] },
  "w04-fri": {
    images: [
      "/media/social/w04-fri-1.jpg",
      "/media/social/w04-fri-2.jpg",
      "/media/social/w04-fri-3.jpg",
      "/media/social/w04-fri-4.jpg",
    ],
  },
  "w05-tue": {
    images: [
      "/media/social/w05-tue-1.jpg",
      "/media/social/w05-tue-2.jpg",
      "/media/social/w05-tue-3.jpg",
      "/media/social/w05-tue-4.jpg",
    ],
  },
  "w05-thu": { images: ["/media/social/w05-thu.jpg"] },
  "w05-fri": {
    video: "/media/social/w05-fri.mp4",
    poster: "/media/social/w05-fri-poster.jpg",
  },
  "w06-tue": {
    video: "/media/social/w06-tue.mp4",
    poster: "/media/social/w06-tue-poster.jpg",
  },
  "w06-thu": { images: ["/media/social/w06-thu.jpg"] },
  "w06-fri": {
    images: [
      "/media/social/w06-fri-1.jpg",
      "/media/social/w06-fri-2.jpg",
      "/media/social/w06-fri-3.jpg",
      "/media/social/w06-fri-4.jpg",
    ],
  },
  "w07-tue": {
    images: [
      "/media/social/w07-tue-1.jpg",
      "/media/social/w07-tue-2.jpg",
      "/media/social/w07-tue-3.jpg",
      "/media/social/w07-tue-4.jpg",
    ],
  },
  "w07-thu": { images: ["/media/social/w07-thu.jpg"] },
  "w07-fri": {
    video: "/media/social/w07-fri.mp4?v=2",
    poster: "/media/social/w07-fri-poster.jpg?v=2",
  },
  "w08-tue": {
    images: [
      "/media/social/w08-tue-1.jpg",
      "/media/social/w08-tue-2.jpg",
      "/media/social/w08-tue-3.jpg",
      "/media/social/w08-tue-4.jpg",
    ],
  },
  "w08-thu": { images: ["/media/social/w08-thu.jpg"] },
  "w08-fri": {
    images: [
      "/media/social/w08-fri-1.jpg",
      "/media/social/w08-fri-2.jpg",
      "/media/social/w08-fri-3.jpg",
      "/media/social/w08-fri-4.jpg",
    ],
  },
  "w09-tue": {
    video: "/media/social/w09-tue.mp4",
    poster: "/media/social/w09-tue-poster.jpg",
  },
  "w09-thu": { images: ["/media/social/w09-thu.jpg"] },
  "w09-fri": {
    video: "/media/social/w09-fri.mp4",
    poster: "/media/social/w09-fri-poster.jpg",
  },
  "w10-tue": {
    images: [
      "/media/social/w10-tue-1.jpg",
      "/media/social/w10-tue-2.jpg",
      "/media/social/w10-tue-3.jpg",
      "/media/social/w10-tue-4.jpg",
    ],
  },
  "w10-thu": {
    images: [
      "/media/social/w10-thu-1.jpg",
      "/media/social/w10-thu-2.jpg",
      "/media/social/w10-thu-3.jpg",
      "/media/social/w10-thu-4.jpg",
    ],
  },
  "w10-fri": { images: ["/media/social/w10-fri.jpg"] },
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
