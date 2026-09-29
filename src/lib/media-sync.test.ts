import { describe, expect, it } from "vitest";
import { getHeroVideoJobs, getMediaSyncJobs } from "./media-sync";

describe("media sync", () => {
  it("copies heroes, interiors, staff, services, optimized clips, and the animation with Node instead of rsync", () => {
    expect(getMediaSyncJobs().map((job) => job.to)).toEqual([
      "public/media/heroes",
      "public/media/interiors",
      "public/media/staff",
      "public/media/services",
      "public/media/video",
      "public/media/animation",
      "public/media/treatments",
    ]);
  });

  it("ships only the silent web renders of the treatment-card loops", () => {
    const loops = getMediaSyncJobs().find((job) => job.to === "public/media/treatments");
    expect(loops?.from).toBe("assets/treatment-animation");
    const files = loops?.files ?? [];
    expect(files).toHaveLength(16);
    for (const name of ["allon4", "fullarch", "snapon", "sedation"]) {
      for (const ext of ["mp4", "webm"]) {
        expect(files).toContain(`treatment-${name}-web-16x9.${ext}`);
        expect(files).toContain(`treatment-${name}-web-9x16.${ext}`);
      }
    }
  });

  it("ships only the silent web renders and posters of the implant animation", () => {
    const animation = getMediaSyncJobs().find((job) => job.to === "public/media/animation");
    expect(animation?.from).toBe("assets/implant-animation");
    expect(animation?.files).toEqual([
      "dental-implant-angled-16x9.png",
      "dental-implant-angled-9x16.png",
      "implant-assemble-web-16x9.mp4",
      "implant-assemble-web-16x9.webm",
      "implant-assemble-web-9x16.mp4",
      "implant-assemble-web-9x16.webm",
    ]);
  });

  it("publishes only mp4 clips from the optimized video folder", () => {
    const video = getMediaSyncJobs().find((job) => job.to === "public/media/video");
    expect(video?.from).toBe("assets/video/optimized");
    expect(video?.extension).toBe(".mp4");
  });

  it("derives landscape and portrait hero clips from the sister-site source", () => {
    const jobs = getHeroVideoJobs();
    expect(jobs.map((job) => job.output)).toEqual([
      "assets/video/optimized/renew-hero-16x9.mp4",
      "assets/video/optimized/renew-hero-9x16.mp4",
    ]);
    for (const job of jobs) {
      expect(job.source).toBe("assets/video/orleans-homepage-hero.mp4");
      expect(job.width).toBeLessThanOrEqual(1280);
    }
  });

  it("trims the loop to the segment without the sister brand's reception sign", () => {
    // Sign is on screen 0–6.75s and 15.25–21.8s of the source clip.
    for (const job of getHeroVideoJobs()) {
      expect(job.start).toBeGreaterThanOrEqual(6.75);
      expect(job.start + job.duration).toBeLessThanOrEqual(15.25);
      expect(job.duration).toBeGreaterThanOrEqual(6);
    }
  });
});
