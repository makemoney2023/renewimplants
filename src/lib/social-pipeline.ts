import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

const ROOT = join(process.cwd(), "docs", "content", "social");

export const PILLARS = [
  "clinical-demystification",
  "social-proof",
  "practice-culture",
  "patient-education",
] as const;

export const LAYOUT_IDS = [
  "light-editorial",
  "carbon-editorial",
  "photo-lower-third",
  "quote-card",
  "video-end-card",
  "cta-still",
] as const;

export const FORMATS = ["video", "static", "carousel"] as const;

const slide = z.object({
  layoutId: z.enum(LAYOUT_IDS),
  onScreen: z.string().min(1).max(48),
  body: z.string().min(8).max(200),
});

const publishBase = {
  id: z.string().min(1),
  status: z.enum(["ready", "needs-consent"]),
  pillar: z.enum(PILLARS),
  layoutId: z.enum(LAYOUT_IDS),
  usePromptPrefix: z.literal(true),
  generatedPerson: z.boolean(),
  hook: z.string().min(8).max(125),
  body: z.string().min(40).max(900),
  onScreen: z.array(z.string().min(1).max(48)).min(1).max(3),
  ctaLabel: z.string().min(1).max(40),
  ctaHref: z.string().startsWith("/implant-candidate-quiz?"),
  assetRefs: z.array(z.string()),
  consent: z.enum(["none", "required-before-faces"]),
  quoteExcerpt: z.string().min(8).nullable(),
  testimonialName: z.string().min(1).nullable(),
  grounding: z.string().min(8),
};

const videoUnit = z.object({
  ...publishBase,
  format: z.literal("video"),
  canvas: z.literal("video-9x16"),
  spoken: z.string().min(20).max(500),
  endCardLayoutId: z.literal("video-end-card"),
});

const staticUnit = z.object({
  ...publishBase,
  format: z.literal("static"),
  canvas: z.literal("static-4x5"),
  squareCanvas: z.literal("static-1x1"),
});

const carouselUnit = z.object({
  ...publishBase,
  format: z.literal("carousel"),
  canvas: z.literal("static-4x5"),
  slides: z.array(slide).min(3).max(6),
});


const designSystemSchema = z.object({
  id: z.literal("renew-implants"),
  tokenSource: z.literal("src/app/globals.css"),
  fontSource: z.literal("src/app/layout.tsx"),
  wordmarkSource: z.literal("src/components/brand-mark.tsx"),
  tokens: z.record(z.string(), z.string().regex(/^#[0-9a-f]{6}$/)),
  type: z.object({
    display: z.object({ family: z.literal("DM Serif Display"), weight: z.literal(400) }),
    text: z.object({ family: z.literal("Plus Jakarta Sans") }),
  }),
  wordmark: z.object({
    word: z.literal("renew"),
    caps: z.literal("implants"),
  }),
  grounds: z.object({
    light: z.record(z.string(), z.string()),
    dark: z.record(z.string(), z.string()),
  }),
  canvases: z.object({
    "video-9x16": z.object({ width: z.literal(1080), height: z.literal(1920) }),
    "static-4x5": z.object({ width: z.literal(1080), height: z.literal(1350) }),
    "static-1x1": z.object({ width: z.literal(1080), height: z.literal(1080) }),
  }),
  formats: z.object({
    video: z.object({
      canvas: z.literal("video-9x16"),
      audio: z.literal(true),
      endCardLayoutId: z.literal("video-end-card"),
    }),
    static: z.object({
      canvas: z.literal("static-4x5"),
      squareCanvas: z.literal("static-1x1"),
      audio: z.literal(false),
    }),
    carousel: z.object({
      canvas: z.literal("static-4x5"),
      audio: z.literal(false),
      minSlides: z.literal(3),
      lastSlideLayoutId: z.literal("cta-still"),
    }),
  }),
  layouts: z.record(
    z.string(),
    z.object({
      ground: z.enum(["light", "dark"]),
      use: z.string(),
      structure: z.array(z.string()).min(3),
    }),
  ),
  approvedMedia: z.array(z.string().startsWith("/media/")),
  promptPrefix: z.string().min(80),
});

export type DesignSystem = z.infer<typeof designSystemSchema>;
export type PublishUnit =
  | z.infer<typeof videoUnit>
  | z.infer<typeof staticUnit>
  | z.infer<typeof carouselUnit>;

const BANNED: { id: string; pattern: RegExp }[] = [
  { id: "price", pattern: /\$\s?\d/ },
  { id: "dr-szarski", pattern: /Dr\.?\s*(Tom|Szarski)/i },
  { id: "guarantee", pattern: /\bguarantee/i },
  { id: "forever", pattern: /\bforever\b/i },
  { id: "lifetime", pattern: /\blifetime\b/i },
  { id: "gold-standard", pattern: /\bgold standard\b/i },
  { id: "cbct", pattern: /\bCBCT\b/ },
  { id: "itero", pattern: /\biTero\b/ },
  { id: "board", pattern: /\bboard[- ]certified\b/i },
  { id: "bite-force", pattern: /\b90\s*%/ },
  { id: "invented-sarah", pattern: /\bSarah\b/ },
  { id: "invented-mark", pattern: /\bMark\b/ },
  { id: "invented-john", pattern: /\bJohn\b/ },
  { id: "credit-hit", pattern: /no credit hit/i },
  { id: "fraction", pattern: /fraction of the (cost|price)/i },
  { id: "fake-spots", pattern: /\b5 new spots\b/i },
  { id: "countdown-hours", pattern: /48 hours/i },
  { id: "package-pricing", pattern: /package pricing/i },
  { id: "younger", pattern: /years younger/i },
  { id: "cured", pattern: /\bcured\b/i },
  { id: "illegal", pattern: /\billegal\b/i },
  { id: "cheat", pattern: /cheat code/i },
  { id: "same-day-permanent", pattern: /same day.{0,40}permanent|permanent.{0,40}same day/i },
];

function readJson(name: string): unknown {
  return JSON.parse(readFileSync(join(ROOT, name), "utf8"));
}

export function cssColorTokens(css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8")) {
  const block = css.match(/:root\s*\{([\s\S]*?)\n\}/);
  if (!block) throw new Error("globals.css is missing a :root block");
  const tokens: Record<string, string> = {};
  for (const match of block[1].matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    tokens[match[1]] = match[2].toLowerCase();
  }
  return tokens;
}

export function loadDesignSystem(): DesignSystem {
  return designSystemSchema.parse(readJson("design-system.json"));
}

export function buildPromptPrefix(design = loadDesignSystem()) {
  return design.promptPrefix.replace(/\{([a-z0-9-]+)\}/g, (whole, name: string) => {
    const hex = design.tokens[name];
    if (!hex) throw new Error(`Prompt prefix names an unknown token: ${name}`);
    return hex;
  });
}

const adFields = {
  geminiNumber: z.number().int().min(1).max(40).nullable(),
  angle: z.enum(["curiosity", "problem", "proof", "offer", "concept"]),
  dropped: z.array(z.string()),
};

const adUnit = z.discriminatedUnion("format", [
  videoUnit.extend(adFields),
  staticUnit.extend(adFields),
  carouselUnit.extend(adFields),
]);

export type AdUnit = z.infer<typeof adUnit>;

export function loadAds(): AdUnit[] {
  const parsed = z
    .object({
      designSystem: z.literal("renew-implants"),
      units: z.array(adUnit),
    })
    .parse(readJson("ads.json"));
  return parsed.units;
}

const organicFields = {
  week: z.number().int().min(1).max(10),
  weekday: z.enum(["tue", "thu", "fri"]),
  platforms: z.array(z.enum(["instagram", "facebook"])).min(2),
  facebookCtaHref: z.string().startsWith("/implant-candidate-quiz?"),
};

export function loadOrganicPosts(): PublishUnit[] {
  const parsed = z
    .object({
      designSystem: z.literal("renew-implants"),
      weeks: z.literal(10),
      posts: z.array(
        z.discriminatedUnion("format", [
          videoUnit.extend(organicFields),
          staticUnit.extend(organicFields),
          carouselUnit.extend(organicFields),
        ]),
      ),
    })
    .parse(readJson("organic-calendar.json"));
  return parsed.posts;
}

export function absoluteClickHref(path: string) {
  const pipeline = z
    .object({
      primaryCta: z.object({
        host: z.literal("https://renewimplants.vercel.app"),
        path: z.literal("/implant-candidate-quiz"),
      }),
    })
    .parse(readJson("pipeline.json"));
  const url = new URL(path, pipeline.primaryCta.host);
  if (url.origin !== pipeline.primaryCta.host) {
    throw new Error(`Click URL left ${pipeline.primaryCta.host}`);
  }
  if (url.pathname !== pipeline.primaryCta.path) {
    throw new Error(`Click URL left the quiz path: ${url.pathname}`);
  }
  return url.toString();
}

export function publishText(unit: PublishUnit) {
  return [
    unit.hook,
    unit.body,
    unit.format === "video" ? unit.spoken : "",
    unit.ctaLabel,
    ...unit.onScreen,
    ...(unit.format === "carousel" ? unit.slides.flatMap((item) => [item.onScreen, item.body]) : []),
  ].join("\n");
}

export function frameSpec(layoutId: string, design = loadDesignSystem()) {
  const layout = design.layouts[layoutId];
  if (!layout) throw new Error(`Missing layout ${layoutId}`);
  const ground = design.grounds[layout.ground];
  const color = (role: string) => {
    const token = ground[role];
    const hex = design.tokens[token];
    if (!hex) throw new Error(`${layoutId} role ${role} is not a token`);
    return { token, hex };
  };
  return {
    layoutId,
    ground: layout.ground,
    ctaFill: color("ctaFill"),
    ctaText: color("ctaText"),
  };
}

export function complianceIssues(text: string) {
  return BANNED.filter((rule) => rule.pattern.test(text)).map((rule) => rule.id);
}

export function endCardSpec(unit: PublishUnit, design = loadDesignSystem()) {
  if (unit.format !== "video") {
    throw new Error(`${unit.id} is ${unit.format}; only video holds an end card`);
  }
  const layout = design.layouts[unit.endCardLayoutId];
  if (!layout) throw new Error(`${unit.id} is missing an end-card layout`);
  const ground = design.grounds[layout.ground];
  const color = (role: string) => {
    const token = ground[role];
    const hex = design.tokens[token];
    if (!hex) throw new Error(`${unit.id} end card role ${role} is not a token`);
    return { token, hex };
  };
  return {
    layoutId: unit.endCardLayoutId,
    ground: layout.ground,
    wordmark: design.wordmark,
    display: design.type.display.family,
    text: design.type.text.family,
    headline: color("headline"),
    eyebrow: color("eyebrow"),
    ctaFill: color("ctaFill"),
    ctaText: color("ctaText"),
    rule: color("rule"),
  };
}
