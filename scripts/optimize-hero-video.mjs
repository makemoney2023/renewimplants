import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

// Derives silent, web-optimized landscape and portrait loops from the
// salvaged Orléans Denture Clinic hero clip (see SISTER-SITE-VIDEO.md).
// Mirrors getHeroVideoJobs() in src/lib/media-sync.ts. The sister clinic's
// reception sign is on screen 0–6.75s and 15.25s–end, so only 7s–15s is used.
const source = "assets/video/orleans-homepage-hero.mp4";
const loop = { start: 7, duration: 8 };
const jobs = [
  { output: "assets/video/optimized/renew-hero-16x9.mp4", width: 1280, height: 720, ...loop },
  { output: "assets/video/optimized/renew-hero-9x16.mp4", width: 720, height: 1280, ...loop },
];

const force = process.argv.includes("--force");

if (!existsSync(source)) {
  console.error(`optimize-hero-video: missing source ${source}`);
  process.exit(1);
}

const probe = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
if (probe.status !== 0) {
  console.error("optimize-hero-video: ffmpeg is required (brew install ffmpeg)");
  process.exit(1);
}

for (const job of jobs) {
  if (existsSync(job.output) && !force) {
    console.log(`optimize-hero-video: keeping ${job.output} (use --force to rebuild)`);
    continue;
  }

  mkdirSync(dirname(job.output), { recursive: true });

  const filter = `scale=${job.width}:${job.height}:force_original_aspect_ratio=increase,crop=${job.width}:${job.height},fps=24`;
  const result = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-ss",
      String(job.start),
      "-t",
      String(job.duration),
      "-i",
      source,
      "-an",
      "-vf",
      filter,
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "28",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      job.output,
    ],
    { stdio: "inherit" },
  );

  if (result.status !== 0) {
    console.error(`optimize-hero-video: ffmpeg failed for ${job.output}`);
    process.exit(result.status ?? 1);
  }

  console.log(`optimize-hero-video: wrote ${job.output}`);
}
