import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { testimonials } from "@/content/testimonials";
import {
  buildPromptPrefix,
  complianceIssues,
  cssColorTokens,
  endCardSpec,
  frameSpec,
  loadAds,
  loadDesignSystem,
  loadOrganicPosts,
  publishText,
} from "./social-pipeline";

const socialDir = join(process.cwd(), "docs", "content", "social");

describe("Renew design system lock", () => {
  const design = loadDesignSystem();

  it("copies every hex token from globals.css and no others", () => {
    expect(design.tokens).toEqual(cssColorTokens());
  });

  it("keeps the typed wordmark and the two brand fonts", () => {
    expect(design.wordmark).toEqual({ word: "renew", caps: "implants" });
    expect(design.type.display.family).toBe("DM Serif Display");
    expect(design.type.text.family).toBe("Plus Jakarta Sans");
  });

  it("resolves the prompt prefix to token hexes only", () => {
    const prefix = buildPromptPrefix(design);
    expect(prefix).not.toMatch(/\{[a-z0-9-]+\}/);
    expect(prefix).toContain(design.tokens.accent);
    expect(prefix).toContain(design.tokens["aqua-deep"]);
    expect(prefix).toContain("DM Serif Display");
    expect(prefix).toContain("Plus Jakarta Sans");
    expect(prefix).toContain("renew");
  });

  it("points every layout role at a real token", () => {
    for (const [id, layout] of Object.entries(design.layouts)) {
      const ground = design.grounds[layout.ground];
      expect(ground, id).toBeDefined();
      for (const token of Object.values(ground)) {
        expect(design.tokens[token], `${id}:${token}`).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });
});

describe("social and ad catalog", () => {
  const design = loadDesignSystem();
  const ads = loadAds();
  const posts = loadOrganicPosts();
  const units = [...ads, ...posts];

  it("covers the 40 Gemini hooks plus the denture-slip film", () => {
    expect(ads).toHaveLength(41);
    const numbers = ads.flatMap((unit) => (unit.geminiNumber == null ? [] : [unit.geminiNumber]));
    expect(numbers).toEqual(Array.from({ length: 40 }, (_, index) => index + 1));
    expect(ads.some((unit) => unit.id === "concept-denture-slip" && unit.generatedPerson)).toBe(true);
  });

  it("schedules 10 weeks at the Tuesday, Thursday, Friday cadence", () => {
    expect(posts).toHaveLength(30);
    expect(posts.map((post) => post.id)).toEqual(
      Array.from({ length: 10 }, (_, week) => ["tue", "thu", "fri"].map((day) => `w${String(week + 1).padStart(2, "0")}-${day}`)).flat(),
    );
  });

  it("keeps the organic pillar mix at 30, 30, 20, and 20", () => {
    const counts = Object.fromEntries(
      ["clinical-demystification", "social-proof", "practice-culture", "patient-education"].map((pillar) => [
        pillar,
        posts.filter((post) => post.pillar === pillar).length,
      ]),
    );
    expect(counts).toEqual({
      "clinical-demystification": 9,
      "social-proof": 9,
      "practice-culture": 6,
      "patient-education": 6,
    });
  });

  it("mixes video, static, and carousel in both catalogs", () => {
    const count = (items: { format: string }[]) => ({
      video: items.filter((item) => item.format === "video").length,
      static: items.filter((item) => item.format === "static").length,
      carousel: items.filter((item) => item.format === "carousel").length,
    });
    expect(count(ads)).toEqual({ video: 14, static: 14, carousel: 13 });
    expect(count(posts)).toEqual({ video: 10, static: 10, carousel: 10 });
    expect(ads.find((unit) => unit.id === "concept-denture-slip")?.format).toBe("video");
  });

  it("publishes only design-system layouts, media, and quiz links", () => {
    const rawAds = readFileSync(join(socialDir, "ads.json"), "utf8");
    const rawPosts = readFileSync(join(socialDir, "organic-calendar.json"), "utf8");
    expect(rawAds).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    expect(rawPosts).not.toMatch(/#[0-9a-fA-F]{3,8}/);

    for (const unit of units) {
      expect(design.layouts[unit.layoutId], unit.id).toBeDefined();
      expect(design.canvases[unit.canvas], unit.id).toBeDefined();
      expect(unit.usePromptPrefix).toBe(true);
      expect(unit.ctaHref).toContain("utm_campaign=" + unit.id);
      expect(unit.ctaLabel.toLowerCase()).not.toMatch(/30 second|one minute|1 minute/);
      for (const asset of unit.assetRefs) {
        expect(design.approvedMedia, unit.id).toContain(asset);
      }
      const frame = frameSpec(unit.layoutId, design);
      expect(frame.ctaFill.hex, unit.id).toBe(design.tokens.accent);
      expect(frame.ctaText.hex, unit.id).toBe(design.tokens["ink-deep"]);
      if (unit.format === "video") {
        const card = endCardSpec(unit, design);
        expect(card.ctaFill.hex).toBe(design.tokens.accent);
        expect(card.ctaText.hex).toBe(design.tokens["ink-deep"]);
        expect(card.display).toBe("DM Serif Display");
        expect(unit.canvas).toBe(design.formats.video.canvas);
      }
      if (unit.format === "static") {
        expect(unit.canvas).toBe(design.formats.static.canvas);
        expect(unit.squareCanvas).toBe(design.formats.static.squareCanvas);
        expect(unit).not.toHaveProperty("spoken");
        expect(unit).not.toHaveProperty("slides");
      }
      if (unit.format === "carousel") {
        expect(unit.canvas).toBe(design.formats.carousel.canvas);
        expect(unit.slides.length).toBeGreaterThanOrEqual(design.formats.carousel.minSlides);
        expect(unit.slides.at(-1)?.layoutId).toBe(design.formats.carousel.lastSlideLayoutId);
        expect(unit).not.toHaveProperty("spoken");
        for (const slide of unit.slides) {
          const slideFrame = frameSpec(slide.layoutId, design);
          expect(slideFrame.ctaFill.hex, unit.id).toBe(design.tokens.accent);
        }
      }
      expect(complianceIssues(publishText(unit)), unit.id).toEqual([]);
    }
  });

  it("quotes a verified review when it names a patient", () => {
    for (const unit of units) {
      if (!unit.testimonialName || !unit.quoteExcerpt) continue;
      const review = testimonials.find((item) => item.name === unit.testimonialName);
      expect(review, unit.id).toBeDefined();
      expect(review?.quote).toContain(unit.quoteExcerpt);
      expect(unit.body).toContain(unit.quoteExcerpt);
      expect(unit.consent).toBe("none");
      expect(unit.assetRefs.some((asset) => asset.includes("patient"))).toBe(false);
    }
    expect(units.filter((unit) => unit.testimonialName).length).toBeGreaterThanOrEqual(12);
  });

  it("keeps every production skill on the Renew Implant Centre brand", () => {
    const pipeline = JSON.parse(readFileSync(join(socialDir, "pipeline.json"), "utf8")) as {
      skills: {
        overrides: string;
        use: { path: string }[];
        brand: { id: string; name: string; wordmark: { word: string; caps: string } };
      };
    };
    const design = loadDesignSystem();
    const skillFile = (dir: string) => join(process.cwd(), dir, "SKILL.md");
    expect(pipeline.skills.brand).toMatchObject({
      id: design.id,
      name: "Renew Implant Centre",
      wordmark: design.wordmark,
    });
    expect(pipeline.skills.overrides).toBe(".cursor/skills/renew-social");
    expect(readFileSync(skillFile(pipeline.skills.overrides), "utf8")).toContain("Renew Implant Centre");
    const used = pipeline.skills.use.map((skill) => skill.path);
    expect(used).toContain(pipeline.skills.overrides);
    for (const path of used) {
      expect(readFileSync(skillFile(path), "utf8").length, path).toBeGreaterThan(40);
    }
  });

  it("allows a generated person only for the unnamed denture-slip film", () => {
    const generated = units.filter((unit) => unit.generatedPerson);
    expect(generated.map((unit) => unit.id)).toEqual(["concept-denture-slip"]);
    expect(generated[0].body.toLowerCase()).toContain("lived-in");
    expect(generated[0].testimonialName).toBeNull();
  });
});
