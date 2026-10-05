import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  defaultLibraryQuery,
  filterSocialPosts,
  parseLibraryQuery,
  socialPreviewHref,
  sortSocialPosts,
} from "./social-preview-model";
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
    expect(socialPreviewHref({ view: "library" })).toBe("/social-preview?view=library");
    expect(
      socialPreviewHref({
        view: "library",
        channel: "facebook",
        library: { format: "video", state: "ready", sort: "name" },
      }),
    ).toBe("/social-preview?view=library&channel=facebook&format=video&state=ready&sort=name");
    expect(socialPreviewHref({ post: "w01-fri", library: { format: "video", week: "1" } })).toBe(
      "/social-preview?post=w01-fri&format=video&week=1",
    );
  });

  it("filters and sorts the full catalog", () => {
    expect(parseLibraryQuery({ format: "nope", week: "99", q: "  scan  " })).toEqual({
      ...defaultLibraryQuery,
      q: "scan",
    });
    expect(parseLibraryQuery({ q: "x".repeat(120) }).q).toHaveLength(80);

    const weekOneVideo = sortSocialPosts(
      filterSocialPosts(posts, parseLibraryQuery({ week: "1", format: "video" })),
      "name",
    );
    expect(weekOneVideo.map((post) => post.id)).toEqual(["w01-fri", "w01-tue"]);

    const byWeek = sortSocialPosts(posts, "week");
    expect(byWeek[0]?.week).toBe(10);
    expect(byWeek.at(-1)?.lane).toBe("paid");
    expect(byWeek.at(-1)?.week).toBeNull();

    const scan = filterSocialPosts(posts, parseLibraryQuery({ q: "3Shape" }));
    expect(scan.some((post) => post.id === "w01-tue")).toBe(true);

    const waiting = filterSocialPosts(posts, parseLibraryQuery({ state: "waiting" }));
    expect(waiting).toHaveLength(0);
    const ready = filterSocialPosts(posts, parseLibraryQuery({ state: "ready" }));
    expect(ready).toHaveLength(posts.length);
  });

  it("keeps week and pillar on every unit", () => {
    const tue = posts.find((post) => post.id === "w01-tue");
    expect(tue?.week).toBe(1);
    expect(tue?.weekday).toBe("tue");
    expect(tue?.pillar).toBe("clinical-demystification");
    const ad = posts.find((post) => post.id === "ad-01");
    expect(ad?.week).toBeNull();
    expect(ad?.weekday).toBeNull();
    expect(ad?.pillar).toBeTruthy();
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

  it("puts weeks 4 to 7 on the preview", () => {
    const thu = posts.find((item) => item.id === "w04-thu");
    expect(thu?.images).toEqual(["/media/social/w04-thu.jpg"]);
    expect(thu?.instagramHref).toBe(
      "https://renewimplants.vercel.app/implant-candidate-quiz?utm_source=instagram&utm_medium=organic&utm_campaign=w04-thu",
    );
    expect(existsSync(join(process.cwd(), "assets/social/w04-thu.jpg"))).toBe(true);
    expect(existsSync(join(process.cwd(), "assets/social/w04-thu-square.jpg"))).toBe(true);

    for (const id of ["w04-tue", "w04-fri", "w05-tue", "w06-fri", "w07-tue"]) {
      const post = posts.find((item) => item.id === id);
      expect(post?.format).toBe("carousel");
      expect(post?.images).toHaveLength(4);
      expect(post?.video).toBeNull();
    }

    for (const id of ["w05-fri", "w06-tue"]) {
      const post = posts.find((item) => item.id === id);
      expect(post?.video).toBe(`/media/social/${id}.mp4`);
      expect(post?.poster).toBe(`/media/social/${id}-poster.jpg`);
      expect(existsSync(join(process.cwd(), "assets/social", `${id}.mp4`))).toBe(true);
      expect(existsSync(join(process.cwd(), "assets/social", `${id}-poster.jpg`))).toBe(true);
    }

    const gz = posts.find((item) => item.id === "w07-thu");
    expect(gz?.caption).toContain("Tom/Alex");
    expect(gz?.caption).not.toContain("Dr. Tom");
  });

  it("puts weeks 8 to 10 on the preview", () => {
    const quote = posts.find((item) => item.id === "w08-thu");
    expect(quote?.images).toEqual(["/media/social/w08-thu.jpg"]);
    expect(quote?.caption).toContain("Stephen E.");
    expect(quote?.instagramHref).toContain("utm_campaign=w08-thu");

    const still = posts.find((item) => item.id === "w10-fri");
    expect(still?.format).toBe("static");
    expect(still?.images).toEqual(["/media/social/w10-fri.jpg"]);
    expect(still?.video).toBeNull();
    expect(existsSync(join(process.cwd(), "assets/social/w10-fri.jpg"))).toBe(true);
    expect(existsSync(join(process.cwd(), "assets/social/w10-fri-square.jpg"))).toBe(true);

    for (const id of ["w09-tue", "w09-fri"]) {
      const post = posts.find((item) => item.id === id);
      expect(post?.video).toBe(`/media/social/${id}.mp4`);
      expect(post?.poster).toBe(`/media/social/${id}-poster.jpg`);
      expect(existsSync(join(process.cwd(), "assets/social", `${id}.mp4`))).toBe(true);
      expect(existsSync(join(process.cwd(), "assets/social", `${id}-poster.jpg`))).toBe(true);
    }

    for (const id of ["w08-tue", "w08-fri", "w10-tue", "w10-thu"]) {
      const post = posts.find((item) => item.id === id);
      expect(post?.images).toHaveLength(4);
      expect(post?.images?.every((path) => existsSync(join(process.cwd(), "assets/social", path.split("/").pop()!)))).toBe(
        true,
      );
    }
  });

  it("puts the paid catalog on the preview", () => {
    const carousel = posts.find((item) => item.id === "ad-01");
    expect(carousel?.format).toBe("carousel");
    expect(carousel?.images).toHaveLength(4);
    expect(carousel?.video).toBeNull();
    expect(carousel?.instagramHref).toBe(
      "https://renewimplants.vercel.app/implant-candidate-quiz?utm_source=meta&utm_medium=paid&utm_campaign=ad-01",
    );
    expect(carousel?.facebookHref).toContain("utm_source=meta");
    expect(carousel?.facebookHref).toContain("utm_medium=paid");

    const six = posts.find((item) => item.id === "ad-25");
    expect(six?.images).toHaveLength(6);

    const quote = posts.find((item) => item.id === "ad-08");
    expect(quote?.images).toEqual(["/media/social/ad-08.jpg"]);
    expect(quote?.caption).toContain("Stephen E.");
    expect(quote?.caption).toContain("I should have done this years ago.");

    const ken = posts.find((item) => item.id === "ad-30");
    expect(ken?.caption).toContain("Ken Miller");
    expect(ken?.caption).toContain("no more pain");

    const still = posts.find((item) => item.id === "ad-40");
    expect(still?.format).toBe("static");
    expect(still?.images).toEqual(["/media/social/ad-40.jpg"]);
    expect(still?.onScreen).toBe("No countdown");

    for (const id of ["ad-02", "ad-28", "concept-denture-slip"]) {
      const post = posts.find((item) => item.id === id);
      expect(post?.format).toBe("video");
      expect(post?.video).toBe(`/media/social/${id}.mp4`);
      expect(post?.poster).toBe(`/media/social/${id}-poster.jpg`);
      expect(post?.instagramHref).toContain("utm_source=meta");
      expect(post?.instagramHref).toContain("utm_medium=paid");
    }

    const paid = posts.filter((post) => post.lane === "paid");
    expect(paid.every((post) => post.video !== null || (post.images?.length ?? 0) > 0)).toBe(true);
    for (const post of paid) {
      for (const path of [post.video, post.poster, ...(post.images ?? [])].filter(Boolean)) {
        const file = path!.split("?")[0]!.split("/").pop()!;
        expect(existsSync(join(process.cwd(), "assets/social", file)), file).toBe(true);
      }
    }
  });

  it("does not invent media for units that have not been rendered", () => {
    const waiting = posts.filter((post) => post.video === null && post.poster === null && post.images === null);
    expect(waiting).toHaveLength(0);
  });
});
