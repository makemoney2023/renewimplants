import { execFileSync, spawn, spawnSync } from "node:child_process";
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
  .frame.photo.strip {
    justify-content: flex-start;
    background: #1a1a1a;
  }
  .frame.photo.strip::before {
    content: "";
    position: relative;
    flex: 0 0 ${photoHeight}%;
    background: #1a1a1a url("${photoUrl}") center top / 100% auto no-repeat;
  }
  .frame.photo.strip .band {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #1a1a1a;
    padding: 64px 80px 72px;
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
  <main class="frame${isPhoto ? " photo" : ""}${photoFit === "top" ? " top-photo" : ""}${photoFit === "strip" ? " strip" : ""}">${isPhoto ? `<div class="band">${stack}</div>` : stack}</main>
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

function holdSpec(video) {
  if (video.quote) return { layoutId: "quote-card", quote: video.quote };
  if (video.photo) {
    return {
      layoutId: "photo-lower-third",
      headline: video.headline,
      body: video.body,
      photo: video.photo,
      photoPosition: video.photoPosition ?? "center",
      photoFit: video.photoFit,
      photoHeight: video.photoHeight ?? 62,
    };
  }
  return {
    layoutId: video.layoutId ?? "carbon-editorial",
    eyebrow: video.eyebrow ?? "Renew",
    headline: video.headline,
    body: video.body,
  };
}

function assembleReel(id, holdJpg, endJpg) {
  const mp4 = join(OUT, `${id}.mp4`);
  const poster = join(OUT, `${id}-poster.jpg`);
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

function renderReel(id, video) {
  const canvas = design.canvases["video-9x16"];
  const mp4 = join(OUT, `${id}.mp4`);
  const poster = join(OUT, `${id}-poster.jpg`);
  if (existsSync(mp4) && existsSync(poster) && process.env.FORCE !== "1") {
    console.log("skip", mp4);
    return;
  }
  const holdJpg = renderFrame(`${id}-hold`, holdSpec(video), canvas);
  const endJpg = renderFrame(`${id}-end`, { layoutId: "cta-still", headline: video.endLine }, canvas);
  assembleReel(id, holdJpg, endJpg);
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

const labPhoto = {
  photo: "public/media/interiors/renew-lab.jpg",
  photoFit: "top",
  photoHeight: 58,
  photoPosition: "center",
};
const archPhoto = {
  photo: "public/media/services/service-allon4.jpg",
  photoFit: "top",
  photoHeight: 56,
  photoPosition: "center",
};
const teamPhoto = {
  photo: "assets/social/ad-29-team-crop.jpg",
  photoFit: "strip",
  photoHeight: 20,
  photoPosition: "center",
};

const ottawa = "Ottawa, ON";
const paidFrames = {
  "ad-01": { eyebrow: "The difference" },
  "ad-02": {
    eyebrow: "Same day",
    body: "The final teeth are made in the onsite lab after the implants have healed.",
  },
  "ad-03": {
    eyebrow: "A fixed plan",
    body: "A fixed implant bridge stays in while you eat. The quiz is about two minutes and nine questions.",
  },
  "ad-04": {
    eyebrow: "At night",
    body: "Implants are anchored in the jaw. You brush them. You do not take them out at night.",
  },
  "ad-05": { eyebrow: "The fit" },
  "ad-06": { eyebrow: "One tooth" },
  "ad-07": {
    body: "The teeth are designed in the same building. The consultation is free.",
    ...labPhoto,
  },
  "ad-08": {
    quote: {
      line: "I should have done this years ago.",
      support: "I'm so happy I had this procedure done.",
      name: "Stephen E.",
      place: ottawa,
    },
  },
  "ad-09": { eyebrow: "Daily life" },
  "ad-10": {
    body: "You may leave with a temporary fixed bridge. The final bridge is made after healing.",
    ...archPhoto,
  },
  "ad-11": {
    quote: {
      line: "I can eat anything I want, no more pain",
      support: "Tom and his team changed my life.",
      name: "Ken Miller",
      place: ottawa,
    },
  },
  "ad-12": {
    eyebrow: "Dinner",
    body: "A fixed bridge stays in at dinner. If the chair is the hard part, sedation is available.",
  },
  "ad-13": { eyebrow: "Adhesive" },
  "ad-14": {
    eyebrow: "A missing tooth",
    body: "Leaving a space can let the bite shift and the bone change. Replacing it starts with a conversation and a 3D scan.",
  },
  "ad-15": {
    eyebrow: "The first visit",
    body: "Tom listens, then a 3D scan. It is not a commitment to surgery.",
  },
  "ad-16": { eyebrow: "The palate" },
  "ad-17": {
    eyebrow: "The bone",
    body: "Dentures rest on the gums. Implants sit in the bone and give it something to hold.",
  },
  "ad-18": { eyebrow: "The options" },
  "ad-19": {
    eyebrow: "Speaking",
    body: "Fixed teeth stay put while you talk, and the daily fear of a slip can ease.",
  },
  "ad-20": {
    eyebrow: "The nightstand",
    body: "A fixed bridge stays in. You still brush it, and you still book cleanings.",
  },
  "ad-21": {
    quote: {
      line: "In 2016, Tom made my lower denture on implants, and I've been extremely satisfied ever since.",
      support: "I feel like family.",
      name: "Chantal G.",
      place: ottawa,
    },
  },
  "ad-22": {
    body: "The visit starts with a 3D scan. Dr. Alex places the implants. Tom designs the teeth.",
    ...labPhoto,
  },
  "ad-23": {
    body: "A temporary fixed bridge. Final teeth come after the implants heal.",
    ...archPhoto,
  },
  "ad-24": {
    quote: {
      line: "They scanned me with a new high tech machine and the fit turned out perfectly.",
      support: "The consultation was so easy and seamless.",
      name: "Bruce L.",
      place: ottawa,
    },
  },
  "ad-25": { eyebrow: "All-on-4" },
  "ad-26": {
    quote: {
      line: "Tom has revived my smile and confidence.",
      support: "I honestly feel like family!",
      name: "Nick B.",
      place: ottawa,
    },
  },
  "ad-27": {
    eyebrow: "Fixed teeth",
    body: "A fixed bridge stops going into a glass. Cleanings still matter.",
  },
  "ad-28": {
    quote: {
      line: "They even went above and beyond for me during an emergency after-hours issue.",
      support: "If you are considering implants, I highly recommend Tom and his team.",
      name: "Tim Appleby",
      place: ottawa,
    },
  },
  "ad-29": {
    body: "Tom Szarski, DD, and Dr. Alex review the 3D scan and explain it in plain language.",
    ...teamPhoto,
  },
  "ad-30": {
    quote: {
      line: "I can eat anything I want, no more pain",
      support: "Talk about life changing!",
      name: "Ken Miller",
      place: ottawa,
    },
  },
  "ad-31": {
    eyebrow: "Orléans",
    body: "About two minutes and nine questions. The clinic is in Orléans, Ottawa.",
  },
  "ad-32": {
    eyebrow: "After the scan",
    body: "You get the numbers after a consultation, once the scan shows the work. Financing can be part of that conversation.",
  },
  "ad-33": { eyebrow: "The visit" },
  "ad-34": {
    eyebrow: "Evenings",
    body: "Weekdays are by appointment. If you need a later time, ask.",
  },
  "ad-35": { eyebrow: "The quiz" },
  "ad-36": { eyebrow: "Upkeep" },
  "ad-37": { eyebrow: "The visit" },
  "ad-38": {
    eyebrow: "Orléans",
    body: "A free consultation at 2530 St Joseph Blvd in Orléans is the next step.",
  },
  "ad-39": { eyebrow: "Coverage" },
  "ad-40": { headline: "Free consultation" },
  "concept-denture-slip": {
    body: "A fixed bridge stays in. The quiz shows whether a consultation is worth it.",
    photo: "assets/social/concept-denture-slip-scene.jpg",
    photoPosition: "center top",
  },
};

const slideBodies = {
  "ad-13": { 0: "A denture often relies on paste to stay put." },
  "ad-33": { 0: "The 3D scan happens at the free consultation." },
  "ad-35": { 1: "The quiz lives on the site, and you answer it there." },
  "ad-36": { 2: "In-house plans are part of the visit." },
  "ad-37": { 2: "The payment conversation happens at the consultation." },
};

const frameBanned = [/\$\d/, /Dr\. Szarski/i, /guarantee/i, /no credit hit/i, /countdown/i, /coupon/i, /\bdollar\b/i, /\bforever\b/i, /lifetime/i, /gold standard/i];

function assertFrameCopy(id, text) {
  for (const pattern of frameBanned) {
    if (pattern.test(text)) throw new Error(`${id} frame has banned copy: ${text}`);
  }
}

const pendingShots = [];
const pendingReels = [];

function enqueueFrame(name, spec, canvas) {
  const jpgPath = join(OUT, `${name}.jpg`);
  if (existsSync(jpgPath) && process.env.FORCE !== "1") {
    console.log("skip", name);
    return jpgPath;
  }
  const htmlPath = join("/tmp/social-frames", `${name}.html`);
  mkdirSync(dirname(htmlPath), { recursive: true });
  writeFileSync(htmlPath, html({ width: canvas.width, height: canvas.height, ...spec }));
  pendingShots.push({ htmlPath, jpgPath, width: canvas.width, height: canvas.height, name });
  return jpgPath;
}

function shootAsync(job) {
  const png = job.htmlPath.replace(/\.html$/, ".png");
  const profile = join("/tmp/social-frames", `chrome-${nameSafe(job.htmlPath)}`);
  return new Promise((resolve, reject) => {
    const chrome = spawn("timeout", ["25", CHROME,
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `--user-data-dir=${profile}`,
      `--window-size=${job.width},${job.height}`,
      "--default-background-color=00000000",
      "--virtual-time-budget=2500",
      `--screenshot=${png}`,
      job.htmlPath,
    ], { stdio: "ignore" });
    chrome.on("error", reject);
    chrome.on("exit", () => {
      if (!existsSync(png)) {
        reject(new Error(`Chrome did not write ${png}`));
        return;
      }
      const ff = spawn("ffmpeg", ["-y", "-i", png, "-q:v", "3", job.jpgPath], { stdio: "ignore" });
      ff.on("error", reject);
      ff.on("exit", (code) => {
        if (code === 0) resolve(job.jpgPath);
        else reject(new Error(`ffmpeg failed for ${job.name}`));
      });
    });
  });
}

async function flushShots() {
  const jobs = pendingShots.splice(0);
  let cursor = 0;
  async function worker() {
    while (cursor < jobs.length) {
      const job = jobs[cursor];
      cursor += 1;
      await shootAsync(job);
      console.log(job.jpgPath, job.width, job.height);
    }
  }
  const workers = Math.min(4, jobs.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
}

function planReel(id, video) {
  const canvas = design.canvases["video-9x16"];
  const mp4 = join(OUT, `${id}.mp4`);
  const poster = join(OUT, `${id}-poster.jpg`);
  if (existsSync(mp4) && existsSync(poster) && process.env.FORCE !== "1") {
    console.log("skip", mp4);
    return;
  }
  const holdJpg = enqueueFrame(`${id}-hold`, holdSpec(video), canvas);
  const endJpg = enqueueFrame(`${id}-end`, { layoutId: "cta-still", headline: video.endLine }, canvas);
  pendingReels.push({ id, holdJpg, endJpg });
}

function assertPhoto(photo) {
  if (photo.endsWith("concept-denture-slip-scene.jpg") || photo.endsWith("ad-29-team-crop.jpg")) {
    if (!existsSync(join(ROOT, photo))) throw new Error(`Missing ${photo}`);
    return;
  }
  const webPath = photo.replace(/^public/, "");
  if (!design.approvedMedia.includes(webPath)) throw new Error(`Photo is not approved media: ${photo}`);
  if (!existsSync(join(ROOT, photo))) throw new Error(`Missing ${photo}`);
}

const adCatalog = JSON.parse(readFileSync(join(ROOT, "docs/content/social/ads.json"), "utf8")).units;

for (const post of adCatalog) {
  const spec = paidFrames[post.id];
  if (!spec) throw new Error(`Missing paid frame ${post.id}`);
  if (spec.quote) {
    if (!testimonials.includes(spec.quote.line) || !testimonials.includes(spec.quote.support)) {
      throw new Error(`Quote is not verbatim in testimonials.ts: ${spec.quote.line}`);
    }
    const excerpt = post.quoteExcerpt ?? "";
    if (!spec.quote.line.includes(excerpt)) throw new Error(`${post.id} quote is not the catalog excerpt`);
    if (spec.quote.name !== post.testimonialName) throw new Error(`${post.id} names the wrong reviewer`);
  }
  if (spec.photo) assertPhoto(spec.photo);
  for (const text of [spec.body, spec.headline, spec.eyebrow, spec.quote?.line, spec.quote?.support].filter(Boolean)) {
    assertFrameCopy(post.id, text);
  }

  if (post.format === "carousel") {
    post.slides.forEach((slide, index) => {
      const body = slideBodies[post.id]?.[index] ?? slide.body;
      assertFrameCopy(post.id, `${slide.onScreen} ${body}`);
      enqueueFrame(`${post.id}-${index + 1}`, {
        layoutId: slide.layoutId,
        eyebrow: spec.eyebrow,
        headline: slide.onScreen,
        body,
      }, fourByFive);
    });
    continue;
  }

  if (post.format === "static" && post.layoutId === "quote-card") {
    enqueueFrame(post.id, { layoutId: "quote-card", quote: spec.quote }, fourByFive);
    enqueueFrame(`${post.id}-square`, { layoutId: "quote-card", quote: spec.quote }, square);
    continue;
  }

  if (post.format === "static") {
    const headline = spec.headline ?? post.onScreen[0];
    if (!post.onScreen.includes(headline)) throw new Error(`${post.id} still headline is not in the catalog`);
    assertFrameCopy(post.id, headline);
    enqueueFrame(post.id, { layoutId: post.layoutId, eyebrow: spec.eyebrow, headline, body: spec.body }, fourByFive);
    enqueueFrame(`${post.id}-square`, { layoutId: post.layoutId, eyebrow: spec.eyebrow, headline, body: spec.body }, square);
    continue;
  }

  if (post.format === "video") {
    const headline = post.onScreen[0];
    assertFrameCopy(post.id, headline);
    planReel(post.id, {
      headline,
      body: spec.body,
      endLine: headline,
      eyebrow: spec.eyebrow,
      layoutId: spec.photo ? "photo-lower-third" : post.layoutId,
      photo: spec.photo,
      photoFit: spec.photoFit,
      photoHeight: spec.photoHeight,
      photoPosition: spec.photoPosition,
      quote: post.layoutId === "quote-card" ? spec.quote : undefined,
    });
  }
}

await flushShots();
for (const reel of pendingReels) assembleReel(reel.id, reel.holdJpg, reel.endJpg);
