import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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
  "w05-tue": {
    eyebrow: "Two options",
    slides: [
      { layoutId: "photo-lower-third", onScreen: "Snap-on teeth come out", body: "They clip to implants and you remove them to clean.", photo: "public/media/services/service-snapon.jpg", photoPosition: "center" },
      { layoutId: "carbon-editorial", onScreen: "All-on-4 stays fixed", body: "It is a bridge you brush. You do not take it out at night." },
      { layoutId: "light-editorial", onScreen: "Both are made here", body: "The consultation sorts out which one the bone and the routine can support." },
      { layoutId: "cta-still", onScreen: "Take the two-minute quiz", body: "About two minutes and nine questions." },
    ],
  },
  "w05-thu": {
    quote: {
      line: "Tom recommended a new procedure to install a removable bar overdenture at his new Renew Implant Centre.",
      support: "I am extremely satisfied with the result.",
      name: "Eric B.",
      place: "Ottawa, ON",
    },
  },
  "w05-fri": {
    video: {
      headline: "Set up before you arrive",
      body: "The room is prepared before you sit down.",
      endLine: "Set up before you arrive",
      photo: "public/media/heroes/renew-hero.jpg",
      photoPosition: "left center",
      photoFit: "top",
    },
  },
  "w06-tue": {
    video: {
      headline: "You can rest through it",
      body: "Sleep dentistry is offered so implant surgery can happen while you rest.",
      endLine: "You can rest through it",
      photo: "public/media/services/service-sedation.jpg",
      photoPosition: "center",
    },
  },
  "w06-thu": {
    quote: {
      line: "They even went above and beyond for me during an emergency after-hours issue.",
      support: "If you are considering implants, I highly recommend Tom and his team.",
      name: "Tim Appleby",
      place: "Ottawa, ON",
    },
  },
  "w06-fri": {
    eyebrow: "CDCP",
    slides: [
      { layoutId: "carbon-editorial", onScreen: "CDCP can cover dentures", body: "Dentures and overdentures, with preauthorization." },
      { layoutId: "carbon-editorial", onScreen: "Most implants are not covered", body: "The plan does not cover most implant treatment." },
      { layoutId: "light-editorial", onScreen: "The team bills plans directly", body: "A quote still waits for the consultation." },
      { layoutId: "cta-still", onScreen: "Take the two-minute quiz", body: "About two minutes and nine questions." },
    ],
  },
  "w07-tue": {
    eyebrow: "Two arches",
    slides: [
      { layoutId: "photo-lower-third", onScreen: "Each arch gets its own plan", body: "Upper and lower are not one drawing.", photo: "public/media/services/service-fullarch.jpg", photoPosition: "center top" },
      { layoutId: "light-editorial", onScreen: "The upper jaw sometimes needs help", body: "A sinus lift only when the scan shows it." },
      { layoutId: "light-editorial", onScreen: "The lower jaw has its own shape", body: "The plan follows that shape." },
      { layoutId: "cta-still", onScreen: "Take the two-minute quiz", body: "About two minutes and nine questions." },
    ],
  },
  "w07-thu": {
    quote: {
      line: "A plan very well executed by the Tom/Alex team",
      support: "New implants, new teeth for a new smile.",
      name: "G Z.",
      place: "Ottawa, ON",
    },
  },
  "w08-tue": {
    eyebrow: "The visit",
    slides: [
      { layoutId: "carbon-editorial", onScreen: "It starts with a conversation", body: "Tom listens before anyone talks about a procedure." },
      { layoutId: "light-editorial", onScreen: "Then a 3D scan", body: "Scans and digital images, in the building." },
      { layoutId: "light-editorial", onScreen: "You leave with a plain plan", body: "Not a surprise price list from social media." },
      { layoutId: "cta-still", onScreen: "Take the two-minute quiz", body: "About two minutes and nine questions." },
    ],
  },
  "w08-thu": {
    quote: {
      line: "I should have done this years ago.",
      support: "I'm so happy I had this procedure done.",
      name: "Stephen E.",
      place: "Ottawa, ON",
    },
  },
  "w08-fri": {
    eyebrow: "Recovery",
    slides: [
      { layoutId: "light-editorial", onScreen: "The surgery uses anesthesia", body: "Sedation is available if the chair is the hard part." },
      { layoutId: "light-editorial", onScreen: "Afterwards: swelling and soreness", body: "It eases over days, not on a script from an ad." },
      { layoutId: "carbon-editorial", onScreen: "Your surgeon writes the instructions", body: "They are written for your case, after the visit." },
      { layoutId: "cta-still", onScreen: "Take the two-minute quiz", body: "About two minutes and nine questions." },
    ],
  },
  "w09-tue": {
    video: {
      headline: "A step, not the whole visit",
      body: "A healing cap shapes the gum for the tooth that follows.",
      endLine: "A step, not the whole visit",
      photo: "public/media/animation/dental-implant-angled-9x16.png",
      photoPosition: "center",
    },
  },
  "w09-thu": {
    quote: {
      line: "From start to finish, I felt extremely well taken care of.",
      support: "Everyone was welcoming, helpful, and friendly.",
      name: "Ernie Minichilli",
      place: "Ottawa, ON",
    },
  },
  "w09-fri": {
    video: {
      headline: "Twenty years in Ottawa",
      body: "The surgeon, the denturist, and the lab work under one roof.",
      endLine: "Twenty years in Ottawa",
      photo: "public/media/staff/tom-szarski.jpg",
      photoPosition: "center top",
      photoFit: "top",
      photoHeight: 48,
    },
  },
  "w10-tue": {
    eyebrow: "Aftercare",
    slides: [
      { layoutId: "light-editorial", onScreen: "Brush the bridge", body: "A fixed bridge stays in, so you brush it." },
      { layoutId: "light-editorial", onScreen: "Clean under it the way you are shown", body: "Often floss threaders or a water flosser, if the hygienist says so." },
      { layoutId: "carbon-editorial", onScreen: "Skip the homemade recipes", body: "The aftercare visit is where the routine is set." },
      { layoutId: "cta-still", onScreen: "Take the two-minute quiz", body: "About two minutes and nine questions." },
    ],
  },
  "w10-thu": {
    eyebrow: "The long gap",
    slides: [
      { layoutId: "carbon-editorial", onScreen: "Bone changes after an extraction", body: "Some people need a graft or a different design." },
      { layoutId: "light-editorial", onScreen: "Years later is not an automatic no", body: "Ask anyway. The scan is the answer." },
      { layoutId: "light-editorial", onScreen: "The quiz is general candidacy", body: "This post is about the long gap, not a yes or no." },
      { layoutId: "cta-still", onScreen: "Take the two-minute quiz", body: "About two minutes and nine questions." },
    ],
  },
  "w10-fri": {
    still: {
      eyebrow: "The first weeks",
      headline: "Soft food first",
      body: "Soups, eggs, yogurt, and tender fish while the implants settle. The team writes the food list for your case.",
    },
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

function photoFileUrl(photo) {
  const source = join(ROOT, photo);
  const bytes = readFileSync(source).subarray(0, 3);
  const jpegNamedPng = photo.endsWith(".png") && bytes[0] === 0xff && bytes[1] === 0xd8;
  if (!jpegNamedPng) return `file://${source}`;
  const copy = join("/tmp/social-frames", "photos", `${nameSafe(photo)}.jpg`);
  mkdirSync(dirname(copy), { recursive: true });
  if (!existsSync(copy)) writeFileSync(copy, readFileSync(source));
  return `file://${copy}`;
}

function html({ width, height, layoutId, eyebrow, headline, body, quote, photo, photoPosition = "center", photoFit, photoHeight = 62 }) {
  const color = paint(layoutId);
  const isCta = layoutId === "cta-still";
  const isQuote = layoutId === "quote-card";
  const isPhoto = layoutId === "photo-lower-third";
  const headlineSize = width === height ? 72 : height > 1400 ? 76 : 80;
  const quoteSize = !quote ? headlineSize : quote.line.length > 70 ? 52 : quote.line.length > 48 ? 60 : width === height ? 64 : 72;
  const photoUrl = photo ? photoFileUrl(photo) : "";
  const stack = isPhoto
    ? `
      <h1>${escapeHtml(headline)}</h1>
      <p class="body">${escapeHtml(body)}</p>
      ${pill(color)}
      <div class="mark">${wordmark(color)}</div>
      ${arch(color)}
    `
    : isCta
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
  h1.quote { font-size: ${quoteSize}px; }
  .frame.photo {
    position: relative;
    justify-content: flex-end;
    padding: 0;
    background: ${photoFit === "top" ? "#1a1a1a" : `#1a1a1a url("${photoUrl}") ${photoPosition} / cover no-repeat`};
  }
  .frame.photo.top-photo::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: ${photoHeight}%;
    background: url("${photoUrl}") ${photoPosition} / cover no-repeat;
  }
  .band {
    position: relative;
    padding: ${height > 1400 ? 160 : 108}px 80px ${height > 1400 ? 88 : 64}px;
    background: linear-gradient(to bottom, rgba(26,26,26,0) 0%, #1a1a1a 24%, #1a1a1a 100%);
  }
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
  <main class="frame${isPhoto ? " photo" : ""}${photoFit === "top" ? " top-photo" : ""}">${isPhoto ? `<div class="band">${stack}</div>` : stack}</main>
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

function nameSafe(path) {
  return path.split("/").pop().replace(/[^a-z0-9.-]/gi, "");
}

function shoot(htmlPath, jpgPath, width, height) {
  const png = htmlPath.replace(/\.html$/, ".png");
  const profile = join("/tmp/social-frames", `chrome-${nameSafe(htmlPath)}`);
  const chrome = spawnSync("timeout", ["12", CHROME,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--user-data-dir=${profile}`,
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
  if (existsSync(jpgPath) && process.env.FORCE !== "1") {
    console.log("skip", jpgPath);
    return jpgPath;
  }
  writeFileSync(htmlPath, html({ width: canvas.width, height: canvas.height, ...spec }));
  shoot(htmlPath, jpgPath, canvas.width, canvas.height);
  console.log(jpgPath, canvas.width, canvas.height);
  return jpgPath;
}

function renderReel(id, video) {
  const canvas = design.canvases["video-9x16"];
  const mp4 = join(OUT, `${id}.mp4`);
  const poster = join(OUT, `${id}-poster.jpg`);
  if (existsSync(mp4) && existsSync(poster) && process.env.FORCE !== "1") {
    console.log("skip", mp4);
    return;
  }
  const holdJpg = renderFrame(`${id}-hold`, {
    layoutId: "photo-lower-third",
    headline: video.headline,
    body: video.body,
    photo: video.photo,
    photoPosition: video.photoPosition,
    photoFit: video.photoFit,
    photoHeight: video.photoHeight,
  }, canvas);
  const endJpg = renderFrame(`${id}-end`, { layoutId: "cta-still", headline: video.endLine }, canvas);
  execFileSync("cp", [holdJpg, poster]);
  const holdMp4 = join("/tmp/social-frames", `${id}-hold.mp4`);
  const endMp4 = join("/tmp/social-frames", `${id}-end.mp4`);
  const list = join("/tmp/social-frames", `${id}-concat.txt`);
  execFileSync("ffmpeg", ["-y", "-loop", "1", "-framerate", "30", "-t", "7.2", "-i", holdJpg, "-vf", "scale=1080:1920,format=yuv420p", "-c:v", "libx264", "-pix_fmt", "yuv420p", holdMp4], { stdio: "ignore" });
  execFileSync("ffmpeg", ["-y", "-loop", "1", "-framerate", "30", "-t", "2.5", "-i", endJpg, "-vf", "scale=1080:1920,format=yuv420p", "-c:v", "libx264", "-pix_fmt", "yuv420p", endMp4], { stdio: "ignore" });
  writeFileSync(list, `file '${holdMp4}'\nfile '${endMp4}'\n`);
  execFileSync("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", mp4], { stdio: "ignore" });
  rmSync(holdJpg, { force: true });
  rmSync(endJpg, { force: true });
  console.log(mp4);
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
      renderFrame(`${id}-${index + 1}`, {
        layoutId: slide.layoutId,
        eyebrow: spec.eyebrow,
        headline: slide.onScreen,
        body: slide.body,
        photo: slide.photo,
        photoPosition: slide.photoPosition,
      }, fourByFive);
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
  if (spec.video) {
    if (post.format !== "video") throw new Error(`${id} is not a video`);
    if (spec.video.headline !== post.onScreen[0]) throw new Error(`${id} video headline drifted from the catalog`);
    renderReel(id, spec.video);
  }
  if (spec.still) {
    if (post.format !== "static" || post.layoutId === "quote-card") {
      throw new Error(`${id} is not an editorial still`);
    }
    if (spec.still.headline !== post.onScreen[0]) throw new Error(`${id} still headline drifted from the catalog`);
    renderFrame(id, { layoutId: post.layoutId, ...spec.still }, fourByFive);
    renderFrame(`${id}-square`, { layoutId: post.layoutId, ...spec.still }, square);
  }
}
