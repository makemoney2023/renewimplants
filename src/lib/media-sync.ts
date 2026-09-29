export type MediaSyncJob = {
  from: string;
  to: string;
  files?: string[];
  extension?: string;
};

export type HeroVideoJob = {
  source: string;
  output: string;
  width: number;
  height: number;
  /** Seconds into the source to start the loop. */
  start: number;
  /** Loop length in seconds. */
  duration: number;
};

export const heroVideoSource = "assets/video/orleans-homepage-hero.mp4";

// The sister clinic's reception sign is visible 0–6.75s and 15.25s–end, so the
// Renew loop uses only the operatory / lab segment in between.
const heroLoop = { start: 7, duration: 8 };

export function getMediaSyncJobs(): MediaSyncJob[] {
  return [
    { from: "assets/heroes", to: "public/media/heroes" },
    { from: "assets/interiors", to: "public/media/interiors" },
    { from: "assets/staff", to: "public/media/staff" },
    { from: "assets/other", to: "public/media/services" },
    {
      from: "assets/video/optimized",
      to: "public/media/video",
      extension: ".mp4",
    },
    {
      from: "assets/implant-animation",
      to: "public/media/animation",
      files: implantAnimationFiles,
    },
  ];
}

// Only the silent, faststart web renders and their posters ship; the audio
// and slow-motion masters stay in assets/.
export const implantAnimationFiles = [
  "dental-implant-angled-16x9.png",
  "dental-implant-angled-9x16.png",
  "implant-assemble-web-16x9.mp4",
  "implant-assemble-web-16x9.webm",
  "implant-assemble-web-9x16.mp4",
  "implant-assemble-web-9x16.webm",
];

export function getHeroVideoJobs(): HeroVideoJob[] {
  return [
    {
      source: heroVideoSource,
      output: "assets/video/optimized/renew-hero-16x9.mp4",
      width: 1280,
      height: 720,
      ...heroLoop,
    },
    {
      source: heroVideoSource,
      output: "assets/video/optimized/renew-hero-9x16.mp4",
      width: 720,
      height: 1280,
      ...heroLoop,
    },
  ];
}
