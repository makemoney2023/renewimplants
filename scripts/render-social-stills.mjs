import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

function ensureFonts(dir) {
  mkdirSync(dir, { recursive: true });
  const files = {
    "DMSerifDisplay-Regular.ttf":
      "https://github.com/google/fonts/raw/main/ofl/dmserifdisplay/DMSerifDisplay-Regular.ttf",
    "PlusJakartaSans-Regular.ttf":
      "https://github.com/google/fonts/raw/main/ofl/plusjakartasans/PlusJakartaSans%5Bwght%5D.ttf",
  };
  for (const [name, url] of Object.entries(files)) {
    const path = join(dir, name);
    if (existsSync(path)) continue;
    execFileSync("curl", ["-fsSL", "-o", path, url], { stdio: "ignore" });
  }
}

const ROOT = process.cwd();
const FONTS = process.env.SOCIAL_FONTS ?? "/tmp/social-fonts";
ensureFonts(FONTS);
const CHROME = process.env.CHROME ?? "/usr/local/bin/google-chrome";
const OUT = join(ROOT, "assets/social");

const design = JSON.parse(readFileSync(join(ROOT, "docs/content/social/design-system.json"), "utf8"));
const calendar = JSON.parse(readFileSync(join(ROOT, "docs/content/social/organic-calendar.json"), "utf8"));
const phone = "613-841-6111";
const cta = "Take the two-minute quiz";

const posts = new Map(calendar.posts.map((post) => [post.id, post]));

/** Patient-facing lines. Compliance notes in the catalog stay off the frame. */
const frames = {
  "w04-tue": {
    eyebrow: "Full arch",
    slides: [
      { layoutId: "carbon-editorial", onScreen: "A few implants hold the arch", body: "All-on-4 replaces a whole arch when the scan says the bone can support it." },
      { layoutId: "light-editorial", onScreen: "Tom designs. Dr. Alex places.", body: "The denturist and the surgeon work in the same building." },
      { layoutId: "light-editorial", onScreen: "The scan decides", body: "It is one option, not a promise for every jaw." },
      { layoutId: "cta-still", onScreen: "Take the two-minute quiz", body: "About two minutes and nine questions." },
    ],
  },
  "w04-thu": {
    quote: {
      line: "Tom has revived my smile and confidence",
      support: "I honestly feel like family!",
      name: "Nick B.",
      place: "Ottawa, ON",
    },
  },
  "w04-fri": {
    eyebrow: "The jaw",
    slides: [
      { layoutId: "light-editorial", onScreen: "A denture does not replace the root", body: "The jaw under it can change, and the fit can loosen." },
      { layoutId: "light-editorial", onScreen: "An implant sits in the bone", body: "It gives the jaw something to hold." },
      { layoutId: "carbon-editorial", onScreen: "Enough bone is a scan question", body: "Whether you have enough bone is a scan question, not a guess." },
      { layoutId: "cta-still", onScreen: "Take the two-minute quiz", body: "About two minutes and nine questions." },
    ],
  },
};

function token(name) {
  const hex = design.tokens[name];
  if (!hex) throw new Error(`Missing token ${name}`);
  return hex;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function paint(layoutId) {
  const layout = design.layouts[layoutId];
  const ground = design.grounds[layout.ground];
  const color = (role) => token(ground[role]);
  return {
    ground: color("ground"),
    headline: color("headline"),
    body: color("body"),
    eyebrow: color("eyebrow"),
    word: color("wordmarkWord"),
    caps: color("wordmarkCaps"),
    ctaFill: color("ctaFill"),
    ctaText: color("ctaText"),
    rule: color("rule"),
  };
}

function html({ width, height, layoutId, eyebrow, headline, body, quote }) {
  const color = paint(layoutId);
  const isCta = layoutId === "cta-still";
  const isQuote = layoutId === "quote-card";
  const headlineSize = width === height ? 72 : 80;
  const stack = isCta
    ? `
      <div class="mark">${wordmark(color)}</div>
      <h1>${escapeHtml(headline)}</h1>
      ${pill(color)}
      <p class="phone">${phone}</p>
      ${arch(color)}
    `
    : isQuote
      ? `
      <p class="eyebrow">Review</p>
      <h1 class="quote">“${escapeHtml(quote.line)}”</h1>
      <p class="support">${escapeHtml(quote.support)}</p>
      <p class="who"><strong>${escapeHtml(quote.name)}</strong> · ${escapeHtml(quote.place)}</p>
      ${pill(color)}
      <p class="phone">${phone}</p>
      <div class="mark">${wordmark(color)}</div>
      ${arch(color)}
    `
      : `
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h1>${escapeHtml(headline)}</h1>
      <p class="body">${escapeHtml(body)}</p>
      ${pill(color)}
      <p class="phone">${phone}</p>
      <div class="mark">${wordmark(color)}</div>
      ${arch(color)}
    `;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: "DM Serif Display";
    src: url("file://${FONTS}/DMSerifDisplay-Regular.ttf") format("truetype");
    font-weight: 400;
    font-style: normal;
  }
  @font-face {
    font-family: "Plus Jakarta Sans";
    src: url("file://${FONTS}/PlusJakartaSans-Regular.ttf") format("truetype");
    font-weight: 100 900;
    font-style: normal;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: ${color.ground}; }
  .frame {
    width: ${width}px;
    height: ${height}px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 88px 88px 72px;
    background: ${color.ground};
    color: ${color.headline};
    font-family: "Plus Jakarta Sans", sans-serif;
  }
  .eyebrow {
    margin-bottom: 28px;
    color: ${color.eyebrow};
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }
  h1 {
    max-width: 900px;
    margin-bottom: 28px;
    font-family: "DM Serif Display", serif;
    font-size: ${headlineSize}px;
    font-weight: 400;
    letter-spacing: -0.02em;
    line-height: 1.02;
    color: ${color.headline};
  }
  h1.quote { font-size: ${width === height ? 64 : 72}px; }
  .body, .support {
    max-width: 820px;
    margin-bottom: 36px;
    color: ${color.body};
    font-size: 36px;
    font-weight: 500;
    line-height: 1.35;
  }
  .support { color: ${token("ink-soft")}; font-weight: 400; }
  .who {
    margin-bottom: 32px;
    color: ${token("ink-deep")};
    font-size: 34px;
    font-weight: 400;
  }
  .who strong { font-weight: 700; }
  .pill {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    height: 88px;
    margin-bottom: 28px;
    padding: 0 36px;
    border-radius: 999px;
    background: ${color.ctaFill};
    color: ${color.ctaText};
    font-size: 32px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .phone {
    margin-bottom: 36px;
    color: ${layoutId === "quote-card" ? token("ink-soft") : color.body};
    font-size: 30px;
    font-weight: 500;
    letter-spacing: 0.01em;
  }
  .mark { display: flex; align-items: baseline; gap: 14px; margin-bottom: 18px; }
  .word {
    font-family: "DM Serif Display", serif;
    font-size: 72px;
    letter-spacing: -0.02em;
    line-height: 1;
    color: ${color.word};
  }
  .caps {
    color: ${color.caps};
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }
  svg { display: block; }
</style>
</head>
<body>
  <main class="frame">${stack}</main>
</body>
</html>`;
}

function wordmark(color) {
  return `<span class="word" style="color:${color.word}">renew</span><span class="caps" style="color:${color.caps}">implants</span>`;
}

function pill(color) {
  return `<div class="pill" style="background:${color.ctaFill};color:${color.ctaText}">${escapeHtml(cta)}</div>`;
}

function arch(color) {
  return `<svg width="640" height="36" viewBox="0 0 640 36" aria-hidden="true">
    <path d="M8 8 C 180 34, 460 34, 632 10" fill="none" stroke="${color.rule}" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

function shoot(htmlPath, jpgPath, width, height) {
  const png = htmlPath.replace(/\.html$/, ".png");
  const chrome = spawnSync("timeout", ["8", CHROME,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--window-size=${width},${height}`,
    "--default-background-color=00000000",
    "--virtual-time-budget=2500",
    `--screenshot=${png}`,
    htmlPath,
  ], { stdio: "ignore" });
  if (!existsSync(png)) {
    throw new Error(`Chrome did not write ${png} (exit ${chrome.status})`);
  }
  execFileSync("ffmpeg", ["-y", "-i", png, "-q:v", "3", jpgPath], { stdio: "ignore" });
}

function renderFrame(name, spec, canvas) {
  const htmlPath = join("/tmp/social-frames", `${name}.html`);
  const jpgPath = join(OUT, `${name}.jpg`);
  mkdirSync(dirname(htmlPath), { recursive: true });
  mkdirSync(OUT, { recursive: true });
  writeFileSync(htmlPath, html({ width: canvas.width, height: canvas.height, ...spec }));
  shoot(htmlPath, jpgPath, canvas.width, canvas.height);
  console.log(jpgPath, canvas.width, canvas.height);
}

const testimonials = readFileSync(join(ROOT, "src/content/testimonials.ts"), "utf8");
for (const spec of Object.values(frames)) {
  if (!spec.quote) continue;
  if (!testimonials.includes(spec.quote.line) || !testimonials.includes(spec.quote.support)) {
    throw new Error(`Quote is not verbatim in testimonials.ts: ${spec.quote.line}`);
  }
}

const fourByFive = design.canvases["static-4x5"];
const square = design.canvases["static-1x1"];

for (const [id, spec] of Object.entries(frames)) {
  const post = posts.get(id);
  if (!post) throw new Error(`Missing catalog post ${id}`);
  if (spec.slides) {
    if (post.format !== "carousel" || post.slides.length !== spec.slides.length) {
      throw new Error(`${id} slide count does not match the catalog`);
    }
    spec.slides.forEach((slide, index) => {
      if (slide.layoutId !== post.slides[index].layoutId) {
        throw new Error(`${id} slide ${index + 1} layout drifted from the catalog`);
      }
      if (slide.onScreen !== post.slides[index].onScreen) {
        throw new Error(`${id} slide ${index + 1} headline drifted from the catalog`);
      }
      renderFrame(`${id}-${index + 1}`, { layoutId: slide.layoutId, eyebrow: spec.eyebrow, headline: slide.onScreen, body: slide.body }, fourByFive);
    });
  }
  if (spec.quote) {
    if (post.format !== "static" || post.layoutId !== "quote-card") {
      throw new Error(`${id} is not a quote card`);
    }
    const excerpt = post.quoteExcerpt ?? "";
    const matches = spec.quote.line.includes(excerpt) || excerpt.includes(spec.quote.line);
    if (!matches) throw new Error(`${id} quote is not the catalog excerpt`);
    renderFrame(id, { layoutId: "quote-card", quote: spec.quote }, fourByFive);
    renderFrame(`${id}-square`, { layoutId: "quote-card", quote: spec.quote }, square);
  }
}
