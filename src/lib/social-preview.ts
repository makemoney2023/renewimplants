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
  "ad-01": { images: ["/media/social/ad-01-1.jpg", "/media/social/ad-01-2.jpg", "/media/social/ad-01-3.jpg", "/media/social/ad-01-4.jpg"] },
  "ad-02": { video: "/media/social/ad-02.mp4", poster: "/media/social/ad-02-poster.jpg" },
  "ad-03": { video: "/media/social/ad-03.mp4", poster: "/media/social/ad-03-poster.jpg" },
  "ad-04": { images: ["/media/social/ad-04.jpg"] },
  "ad-05": { images: ["/media/social/ad-05-1.jpg", "/media/social/ad-05-2.jpg", "/media/social/ad-05-3.jpg", "/media/social/ad-05-4.jpg"] },
  "ad-06": { images: ["/media/social/ad-06-1.jpg", "/media/social/ad-06-2.jpg", "/media/social/ad-06-3.jpg", "/media/social/ad-06-4.jpg"] },
  "ad-07": { video: "/media/social/ad-07.mp4", poster: "/media/social/ad-07-poster.jpg" },
  "ad-08": { images: ["/media/social/ad-08.jpg"] },
  "ad-09": { images: ["/media/social/ad-09-1.jpg", "/media/social/ad-09-2.jpg", "/media/social/ad-09-3.jpg", "/media/social/ad-09-4.jpg"] },
  "ad-10": { video: "/media/social/ad-10.mp4", poster: "/media/social/ad-10-poster.jpg" },
  "ad-11": { images: ["/media/social/ad-11.jpg"] },
  "ad-12": { video: "/media/social/ad-12.mp4", poster: "/media/social/ad-12-poster.jpg" },
  "ad-13": { images: ["/media/social/ad-13-1.jpg", "/media/social/ad-13-2.jpg", "/media/social/ad-13-3.jpg", "/media/social/ad-13-4.jpg"] },
  "ad-14": { images: ["/media/social/ad-14.jpg"] },
  "ad-15": { video: "/media/social/ad-15.mp4", poster: "/media/social/ad-15-poster.jpg" },
  "ad-16": { images: ["/media/social/ad-16-1.jpg", "/media/social/ad-16-2.jpg", "/media/social/ad-16-3.jpg", "/media/social/ad-16-4.jpg"] },
  "ad-17": { images: ["/media/social/ad-17.jpg"] },
  "ad-18": { images: ["/media/social/ad-18-1.jpg", "/media/social/ad-18-2.jpg", "/media/social/ad-18-3.jpg", "/media/social/ad-18-4.jpg"] },
  "ad-19": { video: "/media/social/ad-19.mp4", poster: "/media/social/ad-19-poster.jpg" },
  "ad-20": { images: ["/media/social/ad-20.jpg"] },
  "ad-21": { images: ["/media/social/ad-21.jpg"] },
  "ad-22": { video: "/media/social/ad-22.mp4", poster: "/media/social/ad-22-poster.jpg" },
  "ad-23": { video: "/media/social/ad-23.mp4", poster: "/media/social/ad-23-poster.jpg" },
  "ad-24": { images: ["/media/social/ad-24.jpg"] },
  "ad-25": { images: ["/media/social/ad-25-1.jpg", "/media/social/ad-25-2.jpg", "/media/social/ad-25-3.jpg", "/media/social/ad-25-4.jpg", "/media/social/ad-25-5.jpg", "/media/social/ad-25-6.jpg"] },
  "ad-26": { images: ["/media/social/ad-26.jpg"] },
  "ad-27": { images: ["/media/social/ad-27.jpg"] },
  "ad-28": { video: "/media/social/ad-28.mp4", poster: "/media/social/ad-28-poster.jpg" },
  "ad-29": { video: "/media/social/ad-29.mp4", poster: "/media/social/ad-29-poster.jpg" },
  "ad-30": { images: ["/media/social/ad-30.jpg"] },
  "ad-31": { video: "/media/social/ad-31.mp4", poster: "/media/social/ad-31-poster.jpg" },
  "ad-32": { images: ["/media/social/ad-32.jpg"] },
  "ad-33": { images: ["/media/social/ad-33-1.jpg", "/media/social/ad-33-2.jpg", "/media/social/ad-33-3.jpg", "/media/social/ad-33-4.jpg"] },
  "ad-34": { images: ["/media/social/ad-34.jpg"] },
  "ad-35": { images: ["/media/social/ad-35-1.jpg", "/media/social/ad-35-2.jpg", "/media/social/ad-35-3.jpg", "/media/social/ad-35-4.jpg"] },
  "ad-36": { images: ["/media/social/ad-36-1.jpg", "/media/social/ad-36-2.jpg", "/media/social/ad-36-3.jpg", "/media/social/ad-36-4.jpg"] },
  "ad-37": { images: ["/media/social/ad-37-1.jpg", "/media/social/ad-37-2.jpg", "/media/social/ad-37-3.jpg", "/media/social/ad-37-4.jpg"] },
  "ad-38": { video: "/media/social/ad-38.mp4", poster: "/media/social/ad-38-poster.jpg" },
  "ad-39": { images: ["/media/social/ad-39-1.jpg", "/media/social/ad-39-2.jpg", "/media/social/ad-39-3.jpg", "/media/social/ad-39-4.jpg"] },
  "ad-40": { images: ["/media/social/ad-40.jpg"] },
  "concept-denture-slip": { video: "/media/social/concept-denture-slip.mp4", poster: "/media/social/concept-denture-slip-poster.jpg" },
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
