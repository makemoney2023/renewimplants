import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { socialPreviewHref } from "./social-preview-model";
import { loadSocialPreview } from "./social-preview";

describe("social preview catalog", () => {
  const posts = loadSocialPreview();

  it("lists every organic post and every paid unit", () => {
    expect(posts.filter((post) => post.lane === "organic")).toHaveLength(30);
    expect(posts.filter((post) => post.lane === "paid")).toHaveLength(41);
  });

  it("puts the rendered w01-tue reel on the Vercel quiz", () => {
    const post = posts.find((item) => item.id === "w01-tue");
    expect(post?.video).toBe("/media/social/w01-tue.mp4?v=2");
    expect(post?.poster).toBe("/media/social/w01-tue-poster.jpg?v=2");
    expect(post?.caption).toContain("3Shape");
    expect(post?.ctaLabel).toBe("Take the two-minute quiz");
    expect(post?.instagramHref).toBe(
      "https://renewimplants.vercel.app/implant-candidate-quiz?utm_source=instagram&utm_medium=organic&utm_campaign=w01-tue",
    );
    expect(post?.facebookHref).toContain("utm_source=facebook");
    expect(existsSync(join(process.cwd(), "assets/social/w01-tue.mp4"))).toBe(true);
    expect(existsSync(join(process.cwd(), "assets/social/w01-tue-poster.jpg"))).toBe(true);
  });

  it("builds preview links for the channel and the catalog", () => {
    expect(socialPreviewHref()).toBe("/social-preview");
    expect(socialPreviewHref({ channel: "facebook" })).toBe("/social-preview?channel=facebook");
    expect(socialPreviewHref({ post: "w02-fri", channel: "facebook", catalog: true })).toBe(
      "/social-preview?post=w02-fri&channel=facebook&catalog=1",
    );
  });

  it("puts the rendered w07-fri reel on the Vercel quiz", () => {
    const post = posts.find((item) => item.id === "w07-fri");
    expect(post?.label).toBe("Week 7 fri");
    expect(post?.video).toBe("/media/social/w07-fri.mp4?v=2");
    expect(post?.poster).toBe("/media/social/w07-fri-poster.jpg?v=2");
    expect(post?.caption).toContain("English or French");
    expect(post?.instagramHref).toBe(
      "https://renewimplants.vercel.app/implant-candidate-quiz?utm_source=instagram&utm_medium=organic&utm_campaign=w07-fri",
    );
    expect(post?.facebookHref).toContain("utm_source=facebook");
    expect(post?.facebookHref).toContain("utm_campaign=w07-fri");
    expect(existsSync(join(process.cwd(), "assets/social/w07-fri.mp4"))).toBe(true);
    expect(existsSync(join(process.cwd(), "assets/social/w07-fri-poster.jpg"))).toBe(true);
  });

  it("puts weeks 1 to 3 on the preview", () => {
    const thu = posts.find((item) => item.id === "w01-thu");
    expect(thu?.format).toBe("static");
    expect(thu?.images).toEqual(["/media/social/w01-thu.jpg"]);
    expect(thu?.video).toBeNull();
    expect(thu?.instagramHref).toBe(
      "https://renewimplants.vercel.app/implant-candidate-quiz?utm_source=instagram&utm_medium=organic&utm_campaign=w01-thu",
    );
    expect(existsSync(join(process.cwd(), "assets/social/w01-thu.jpg"))).toBe(true);
    expect(existsSync(join(process.cwd(), "assets/social/w01-thu-square.jpg"))).toBe(true);

    const fri = posts.find((item) => item.id === "w02-fri");
    expect(fri?.format).toBe("carousel");
    expect(fri?.images).toHaveLength(4);
    expect(fri?.images?.every((path) => existsSync(join(process.cwd(), "assets/social", path.split("/").pop()!)))).toBe(
      true,
    );

    for (const id of ["w01-fri", "w02-tue", "w03-tue", "w03-fri"]) {
      const post = posts.find((item) => item.id === id);
      expect(post?.video).toBe(`/media/social/${id}.mp4`);
      expect(post?.images).toBeNull();
      expect(existsSync(join(process.cwd(), "assets/social", `${id}.mp4`))).toBe(true);
      expect(existsSync(join(process.cwd(), "assets/social", `${id}-poster.jpg`))).toBe(true);
    }
  });

  it("puts week 4 on the preview", () => {
    const thu = posts.find((item) => item.id === "w04-thu");
    expect(thu?.format).toBe("static");
    expect(thu?.images).toEqual(["/media/social/w04-thu.jpg"]);
    expect(thu?.video).toBeNull();
    expect(thu?.caption).toContain("Nick B.");
    expect(thu?.instagramHref).toBe(
      "https://renewimplants.vercel.app/implant-candidate-quiz?utm_source=instagram&utm_medium=organic&utm_campaign=w04-thu",
    );
    expect(thu?.facebookHref).toContain("utm_source=facebook");
    expect(existsSync(join(process.cwd(), "assets/social/w04-thu.jpg"))).toBe(true);
    expect(existsSync(join(process.cwd(), "assets/social/w04-thu-square.jpg"))).toBe(true);

    for (const id of ["w04-tue", "w04-fri"]) {
      const post = posts.find((item) => item.id === id);
      expect(post?.format).toBe("carousel");
      expect(post?.images).toHaveLength(4);
      expect(post?.video).toBeNull();
      expect(post?.images?.every((path) => existsSync(join(process.cwd(), "assets/social", path.split("/").pop()!)))).toBe(
        true,
      );
    }
  });

  it("does not invent media for units that have not been rendered", () => {
    const rendered = new Set([
      "w01-tue",
      "w01-thu",
      "w01-fri",
      "w02-tue",
      "w02-thu",
      "w02-fri",
      "w03-tue",
      "w03-thu",
      "w03-fri",
      "w04-tue",
      "w04-thu",
      "w04-fri",
      "w07-fri",
    ]);
    const waiting = posts.filter((post) => !rendered.has(post.id));
    expect(waiting.every((post) => post.video === null && post.poster === null && post.images === null)).toBe(true);
  });
});
