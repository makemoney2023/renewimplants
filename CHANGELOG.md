# Changelog

Newest first. Hub docs (`README.md`, `SITE-MAP.md`, `docs/scroll-world-brief.md`)
are stable references; deltas live here.

## 2026-10-05 — Larger type and a 3D scan on the Tuesday reel

**What changed:** The opening line on `w01-tue` is larger. The black slide shows a 3D scan of the upper and lower teeth.

**Why:** fix — the spoken line was too small to read on a phone, and the black slide had no scan.

**Code touchpoints:** `assets/social/w01-tue.mp4`, `assets/social/w01-tue-poster.jpg`, `assets/social/w01-tue-scan.jpg`, `src/lib/social-preview.ts`

**Data-flow impact:** none. The catalog copy is unchanged.

**API / schema impact:** none.

**Verification:** frames rendered at 1080×1920, then the reel in `/social-preview`.

## 2026-10-05 — Social catalog preview

**What changed:** `/social-preview` shows the catalog the way a post sits on Instagram and Facebook. `w01-tue` plays the rendered 9:16 reel. The other units are listed and marked waiting until a file is added under `assets/social/`.

**Why:** feature — the reel lived only as a local file. The quiz link on that post goes to `https://renewimplants.vercel.app`.

**Code touchpoints:** `src/app/social-preview/page.tsx`, `src/components/social-preview/`, `src/lib/social-preview.ts`, `assets/social/`, `src/lib/media-sync.ts`, `src/app/robots.ts`

**Data-flow impact:** none. The page is noindex and omitted from the sitemap.

**API / schema impact:** none.

**Verification:** `npx vitest run src/lib/social-preview.test.ts src/lib/media-sync.test.ts src/app/robots.test.ts src/app/sitemap.test.ts`, then the preview in the browser.

## 2026-10-05 — Social clicks use the live quiz host

**What changed:** ad and social quiz links resolve on `https://renewimplants.vercel.app`. `absoluteClickHref()` joins that host to each unit’s `ctaHref`.

**Why:** fix — `https://www.renewimplants.ca/implant-candidate-quiz` returns 404. The quiz is served by the Vercel deployment.

**Code touchpoints:** `docs/content/social/pipeline.json`, `docs/content/social/distribution.json`, `src/lib/social-pipeline.ts`, `src/lib/social-pipeline.test.ts`, `.cursor/skills/renew-social/SKILL.md`

**Data-flow impact:** none. Blog canonical host stays `https://www.renewimplants.ca`.

**API / schema impact:** none.

**Verification:** `npx vitest run src/lib/social-pipeline.test.ts`.

## 2026-10-05 — Design and video skills on the social pipeline

**What changed:** stills now open banner layout, token checks, carousel structure, and a contrast pass. Video now opens Remotion for the composition, type motion, captions, and export, and OpenMontage for fades, kinetic type, and the ffmpeg cut.

**Why:** fix — those skills were already in the repo. The frame stays Renew Implant Centre: the same tokens, DM Serif Display, Plus Jakarta Sans, and the typed wordmark.

**Code touchpoints:** `docs/content/social/pipeline.json`, `.cursor/skills/renew-social/SKILL.md`

**Data-flow impact:** none.

**API / schema impact:** none.

**Verification:** `npx vitest run src/lib/social-pipeline.test.ts`.

## 2026-10-05 — Social pipeline skill map

**What changed:** `docs/content/social/pipeline.json` names the repo skills a producer opens for carousel size, video specs, FFmpeg, Remotion type frames, and FLUX prompting. Every frame stays Renew Implant Centre: the design-system tokens and the typed `renew implants` wordmark.

**Why:** fix — community skills can supply a technique. The brand on the frame is Renew.

**Code touchpoints:** `docs/content/social/pipeline.json`, `.cursor/skills/renew-social/SKILL.md`, `src/lib/social-pipeline.test.ts`

**Data-flow impact:** none.

**API / schema impact:** none.

**Verification:** `npx vitest run src/lib/social-pipeline.test.ts`.

## 2026-10-05 — Video, static, and carousel mix

**What changed:** the social catalog no longer ships as video only. Paid units are 14 video, 14 static, and 13 carousel. The 30 feed posts are 10 of each. Static is a 4:5 frame plus a square, with no voiceover. Carousels close on the still CTA card. Video still holds the 2.5 second end card.

**Why:** feature — Instagram, Facebook, and Meta need all three shapes, on the same Renew tokens and wordmark.

**Code touchpoints:** `docs/content/social/*`, `src/lib/social-pipeline.ts`, `src/lib/social-pipeline.test.ts`, `.cursor/skills/renew-social/SKILL.md`

**Data-flow impact:** none. No pages, leads, or schema changed.

**API / schema impact:** none.

**Verification:** `npx vitest run src/lib/social-pipeline.test.ts`.

## 2026-10-05 — Social and paid-video pipeline

**What changed:** the Gemini organic-social plan and the 40 implant ad scripts are stored as a production catalog. Every unit resolves to the live Renew design tokens, the typed wordmark, and the quiz URL. Unsafe claims from the drafts (prices, invented patients, same-day permanent teeth, fake scarcity) are dropped before publish.

**Why:** feature — give Instagram, Facebook, and Meta video a single brief format that cannot drift off the clinic’s palette or compliance rules.

**Code touchpoints:** `docs/content/social/*`, `src/lib/social-pipeline.ts`, `src/lib/social-pipeline.test.ts`, `.cursor/skills/renew-social/SKILL.md`, `docs/content/content-strategy.md`, `docs/search-visibility.md`

**Data-flow impact:** none. No pages, leads, or schema changed.

**API / schema impact:** none.

**Verification:** `npx vitest run src/lib/social-pipeline.test.ts` (10 tests) and `npx tsc --noEmit`.

## 2026-10-02 — Blog content strategy backlog

**What changed:** the Gemini implant content strategy (hub-and-spoke guides plus 105 blog topics) is saved as a Renew working backlog, with Wave 1 titles, clusters, and the clinic’s locked claims applied before any new posts are drafted.

**Why:** feature — give the blog program a single plan to expand from, without publishing prices, the wrong clinician title, or a second URL for a query the site already answers.

**Code touchpoints:** `docs/content/content-strategy.md`, `docs/search-visibility.md`, `docs/plans/2026-09-29-seo-blog-lead-quiz-plan.md`, `README.md`

**Data-flow impact:** none. No posts, routes, or schema changed.

**API / schema impact:** none.

**Verification:** doc-only. No tests run.

## 2026-09-29 — Responsive and cross-device quality pass

**What changed:** the hero now exposes the consultation and two-minute candidate
quiz as responsive CTAs; the header, experience pages, blog layouts, tables, and
cards reflow without horizontal clipping from 320 px through desktop. Treatment
loops select portrait sources/posters on mobile, defer loading, play only while
visible, and pause or remain posters for reduced-motion users. Touch layouts use
a native scroll-snap treatment rail instead of GSAP pinning.

Accessibility polish adds a keyboard skip link, safe-area-aware fixed-header
spacing, 44 px controls, valid quiz fieldset naming, stronger aqua contrast,
visible focus states, accessible comparison-table headers, and clean landmarks.

**Why:** bug fix — remove broken media requests, clipped CTAs/content, cramped
navigation, motion overload, and keyboard/screen-reader barriers across mobile,
tablet, and desktop.

**Code touchpoints:**
- `src/app/globals.css`, `src/app/layout.tsx`, all page-level `<main>` renderers
- `src/components/{scroll-world,experience-page,loop-video}.tsx`
- `src/components/quiz/{quiz-question,quiz-lead-form,quiz-cta}.tsx`
- `src/components/blog/mdx-components.tsx`, blog index/post pages
- `src/lib/media-sync.ts`, `scripts/media-sync.mjs`, responsive/media regression specs
- `README.md`, `ASSETS-MANIFEST.md`

**Data-flow impact:** media sync now uses the typed allow-list directly and fails
predev/prebuild when a required source is missing. Video playback is gated by
viewport visibility and the user's motion preference.

**API / schema impact:** none.

**Verification:** `npm test` — 27 files / 185 tests; `npm run lint`,
`npm run typecheck`, and `npm run build` pass (44 generated pages). Browser QA:
31 sitemap pages × 5 widths (320, 390, 768, 1024, 1440) produced zero status,
media, console, landmark, heading, or overflow issues; eight representative axe
audits at mobile/desktop produced zero violations; mobile navigation, skip link,
FAQ, comparison table, service CTA, all nine quiz steps, invalid lead handling,
and reduced-motion fallbacks were exercised.

## 2026-09-29 — Why Choose Us panorama photos were crushed

**What changed:** the "Your implants are made right here" photo stage on `/why-choose-us` keeps its 280svh height. `.chapter-act` no longer overrides it down to 88svh, which had collapsed the absolutely positioned tiles into ~30px strips.

**Why:** bug fix.

**Code touchpoints:** `src/app/globals.css` (`.chapter-act:not(.panorama-section)`).

**Data-flow impact:** none.

**API / schema impact:** none.

**Verification:** measured tile boxes on `localhost:3111/why-choose-us` (section 2682px, tiles 472–629px tall) and confirmed the photos render in the browser.

## 2026-09-29 — Animated treatment cards in the homepage rail

**What changed:** the four treatment cards in the "Choice" rail (All-on-4, full arch,
snap-on, sedation) now play silent 8 s Gemini Omni loops animated from their service
photos, with landscape/portrait + WebM/MP4 sources like the implant-anatomy card.
The photo stays as the poster and the reduced-motion fallback (`.scene-video` hidden).

**Why:** feature — every card in the horizontal rail now moves, not just the first.

**Code touchpoints:**
- `src/content/site.ts` (`treatmentLoop()`, `animation` on each treatment), `src/components/scroll-world.tsx` (`LoopVideo` per card), `src/app/globals.css` (`.treatment-video`)
- `src/lib/media-sync.ts` (`treatmentAnimationFiles`) mirrored in `scripts/media-sync.mjs`
- `assets/treatment-animation/` (8 Omni masters + 16 web renders), `ASSETS-MANIFEST.md`

**Data-flow impact:** new sync job `assets/treatment-animation → public/media/treatments`.

**API / schema impact:** none.

**Verification:** `npm test` 181/181, `npm run typecheck` clean, eslint clean on changed
files; dev server serves all 16 sources; playback confirmed in browser.

## 2026-09-29 — SEO/AEO/GEO blog + implant candidate quiz funnel

**What changed:** the blog moves out of `routes.ts` into an MDX pipeline with
PIRX-style answer-first posts, extraction tables, sourced stats, visible FAQs, and
MedicalWebPage/BlogPosting/FAQPage JSON-LD. A nine-question implant candidate quiz
at `/implant-candidate-quiz` captures leads through `POST /api/quiz-leads` into a
Supabase `quiz_leads` table. The quiz is linked from the Patients menu, every service
page, and every post (UTM-tagged). Adds sitemap.xml, an AI-crawler robots allowlist,
llms.txt, RSS, IndexNow, GA4 funnel events, first-touch UTM capture, and Search
Console / Bing verification tags.

**Why:** feature — drive organic and AI-referred traffic into a lead funnel
(spec: `docs/specs/2026-09-29-seo-blog-lead-quiz-spec.md`).

**Code touchpoints:**
- `content/blog/*.mdx` (5 migrated posts, unsourced legacy stats removed), `src/lib/blog.ts`, `src/lib/blog-schema.ts`, `src/lib/blog-rss.ts`, `src/content/authors.ts`
- `src/app/blog/{page.tsx,[slug]/page.tsx,[slug]/opengraph-image.tsx,rss.xml/route.ts}`, `src/components/blog/*`
- `src/lib/quiz/*` (questions, result paths, scoring, zod lead schema, Supabase store, landing content), `src/app/api/quiz-leads/route.ts`, `src/app/implant-candidate-quiz/**`, `src/components/quiz/*`
- `src/components/ui/{radio-group,checkbox,input,label,progress}.tsx` + `components.json` (shadcn); `@theme inline` token map in `globals.css`
- `src/lib/site-schema.ts` rewritten around one sitewide `@graph` in `layout.tsx`; `src/app/{sitemap,robots}.ts`, `src/lib/site-pages.ts`, `public/llms.txt`, `src/lib/{indexnow,analytics,utm,site-verification}.ts`, `scripts/submit-indexnow.ts`
- `src/content/routes.ts` — `blog` + 5 `blog/*` entries removed; `nav.ts` — quiz under Patients; `route-actions.tsx` accepts children; `experience-page.tsx` — quiz CTA on `services/*`
- `supabase/migrations/20260929150000_quiz_leads.sql`, `.env.example`, `vitest.setup.ts`
- `.cursor/skills/seo-geo-aeo` (from PIRX), `.cursor/skills/renew-blog-writing`, `docs/search-visibility.md`

**Data-flow impact:** new path quiz → API → Supabase. Blog content now comes from
`content/blog` rather than `routes.ts`. JSON-LD moves from per-page to a sitewide
graph plus per-page graphs.

**API / schema impact:** new `POST /api/quiz-leads` (201 `{id, resultPath,
modifiers, leadTier}` / 400 `{error, fields}` / 500 `{error}`); new table
`quiz_leads` — **migration not applied yet** (Supabase org at its free-project limit).

**Verification:** `npm test` (25 files, 178 tests), `npm run lint`, `npm run typecheck`,
`npm run build` all pass; routes smoke-tested on `next start`; quiz walked through
in Playwright.

## 2026-09-29 — Packaging palette + implant-assembly loop

**What changed:** the design tokens move from navy/peach/teal to the Novadent
packaging palette (matte black `#1a1a1a`, lime `#8dc41d`, aqua `#009ce3`, white),
and the generated implant-assembly animation is wired in: it leads the homepage
treatment rail as an "anatomy" card and opens the five implant-placement service
pages as the first-act visual.

**Why:** feature — brand alignment with the current ad creative, plus a
"what is an implant" moment before the treatment choice.

**Code touchpoints:**
- `src/app/globals.css` — retokened `:root` (`--carbon`, `--ink-deep`, `--accent*`
  lime, `--aqua*`), lime primary button with aqua hover, aqua arch line, black
  scrims, new `.anatomy-card`, `.anatomy-video`, `.act-video`, `.has-loop`
- `src/app/icon.svg` — black tile, lime "r"
- `src/content/site.ts` — `implantAnimation` (posters + web mp4/webm, both aspects)
- `src/content/routes.ts` — `RouteAct` gains `video/webm/mobileVideo/mobileWebm/poster/mobilePoster`; `implantLoop` spread into the first act of all-on-4, full-arch, same-day, upper-jaw, lower-jaw
- `src/components/loop-video.tsx` (new), `scroll-world.tsx` (anatomy card), `experience-page.tsx` (video overlay in trust/split acts)
- `src/lib/media-sync.ts` + `scripts/media-sync.mjs` — `assets/implant-animation → public/media/animation`, allow-listed to six files

**Data-flow impact:** media sync gains one job; route acts can carry a loop.

**API / schema impact:** none.

**Verification:** `npx vitest run` — 109 tests pass (three test *files* from the
parallel blog/quiz workstream fail to load on their own missing modules);
`eslint` and `tsc --noEmit` clean on every file listed above; `next build`
compiles but is blocked at the type-check step by the same in-flight blog/quiz
files (`src/app/layout.tsx:42`, `src/app/sitemap.test.ts`). Browser check on the
dev server: hero, All-on-4 first act and rail card render in the new palette;
both loops report `readyState 4`, playing.

## 2026-09-29 — Rebuild the site as a Next.js scroll world

**What changed:** the salvage pack now contains a working Next.js 16 site that
republishes the homepage as a six-act GSAP scroll world and every recovered inner
page under its original URL, following the Wilk & Wilk rebuild architecture.

**Why:** feature — first deployable rebuild of renewimplants.ca.

**Code touchpoints:**
- `package.json`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.mjs`,
  `postcss.config.mjs`, `next.config.ts`, `.gitignore`
- `src/app/{layout,page,globals.css,icon.svg}` and `src/app/[...slug]/page.tsx`
- `src/content/{site,nav,routes,testimonials}.ts` (+ specs)
- `src/components/{scroll-world,experience-page,document-page,site-header,site-footer,brand-mark,route-actions,faq-list,testimonial-list}.tsx`, `src/components/ui/button.tsx`
- `src/lib/{media-sync,site-schema,scroll-motion,utils}.ts` (+ specs)
- `scripts/media-sync.mjs`, `scripts/optimize-hero-video.mjs`
- `assets/video/optimized/renew-hero-{16x9,9x16}.mp4` (derived, committed)
- `pages/` → `recovered/pages/` (Next.js reserves a root `pages/` folder; `COPY.md` links updated)

**Data-flow impact:** `assets/*` → `public/media/*` at predev/prebuild;
`src/content/*` → `ScrollWorld` / `ExperiencePage` / `DocumentPage`; JSON-LD
built from content by `src/lib/site-schema.ts`.

**API / schema impact:** none (static site, no backend, no env vars).

**Content decisions:**
- Wordmark is typed; no logo asset was ever served.
- Before/after photos were unrecoverable; `/before-after` restores four described cases.
- Hero loop uses only seconds 7–15 of the sister clinic's clip so their sign never shows.
- 52 MB interview video stays local (gitignored), not shipped.

**Verification:** `npm test` (33 passing), `npm run lint` (clean),
`npm run typecheck` (clean), `npm run build` (33 static pages), manual check of
`/`, `/services/all-on-4-dental-implants`, `/why-choose-us`, `/contact-us` at
mobile and 1440 px widths.
