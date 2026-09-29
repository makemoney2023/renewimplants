# Renew Implant Centre — website rebuild

A Next.js 16 rebuild of [renewimplants.ca](https://www.renewimplants.ca/) using the
scroll-world architecture from the Wilk & Wilk rebuild: a GSAP ScrollTrigger
homepage told in six acts, every recovered inner page republished under its
original URL, and all copy kept as typed content in `src/content`.

The folder is also the original **salvage pack** (scrape output). That material is
documented in [Salvage pack](#salvage-pack) below and stays untouched under
`recovered/`, `raw/`, `assets/`, and the top-level `*.md` inventories.

## Run

```bash
npm install
npm run dev        # predev copies assets/ → public/media/
npm test           # Vitest content + lib specs
npm run lint       # ESLint (next/core-web-vitals + typescript)
npm run typecheck  # tsc --noEmit
npm run build      # prebuild syncs media, then next build
npm run media:hero # re-derive the hero loops with ffmpeg (needs brew install ffmpeg)
npm run indexnow   # after a deploy: submit every sitemap URL to IndexNow (Bing / ChatGPT)
```

Node 24+ (the IndexNow script uses native type stripping) and npm. Copy
`.env.example` to `.env.local`; every variable is optional in development:

| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | IndexNow script (defaults to `site.url`) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | `POST /api/quiz-leads` (server only; without them the API returns a 500 with the clinic phone number) |
| `NEXT_PUBLIC_GA_ID` | GA4 tag + quiz funnel events (`G-…`; omitted = no tag) |
| `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` | Search Console / Bing Webmaster meta tags |
| `INDEXNOW_KEY` | `npm run indexnow`; must match `public/<key>.txt` |

## Layout

| Path | Role |
|---|---|
| `src/app/layout.tsx` | Fonts (DM Serif Display + Plus Jakarta Sans), metadata + verification, `SiteHeader`, sitewide Dentist/WebSite/Person JSON-LD, GA4, first-touch UTM capture |
| `src/app/page.tsx` | Homepage: `ScrollWorld` |
| `src/app/[...slug]/page.tsx` | Catch-all for the 23 inner routes (`services/*` keeps its nesting); picks the `experience` or `document` grammar; emits WebPage/MedicalWebPage + BreadcrumbList + FAQPage JSON-LD |
| `src/app/blog/**` | Blog index, MDX posts, per-post OG image, `/blog/rss.xml` — see [Blog](#blog) |
| `src/app/implant-candidate-quiz/**`, `src/app/api/quiz-leads/route.ts` | Lead quiz page, noindex thank-you page, lead API — see [Lead quiz](#lead-quiz) |
| `src/app/{sitemap,robots}.ts`, `public/llms.txt` | Crawl surface: sitemap from `getIndexablePaths()`, AI-crawler allowlist, llms.txt |
| `src/app/globals.css` | The whole design system as tokens + classes (`--carbon`, `--accent` lime, `--aqua`, …) — see [Palette](#palette) |
| `src/content/site.ts` | NAP, CTAs, hours, media map, the six `scrollActs`, treatments, process steps |
| `src/content/nav.ts` | Five-parent navigation + legacy redirect aliases |
| `src/content/routes.ts` | Every inner page: grammar, acts, sections, FAQs, quotes, hours, next-step links |
| `src/content/testimonials.ts` | Ten verified Google reviews (name + "Ottawa, ON") |
| `src/components/scroll-world.tsx` | Homepage acts and all GSAP wiring; leads the treatment rail with the implant-anatomy card |
| `src/components/experience-page.tsx` | Chapter pages: one `ChapterAct` per motion device, then body, quotes, FAQs, actions; acts with `video` get a `LoopVideo` overlay |
| `src/components/loop-video.tsx` | Visibility-aware silent loop: WebM-first sources, portrait pair under 800px, responsive poster fallback, `preload="none"`, hidden under reduced motion |
| `src/components/document-page.tsx` | Reading pages: content hero, hours, sections, quotes, FAQs, sitemap index |
| `src/components/{site-header,site-footer,brand-mark,route-actions,faq-list,testimonial-list}.tsx` | Shell and shared blocks |
| `src/components/ui/button.tsx` | shadcn-style `Button` (cva + Radix Slot) mapped onto the `.button*` classes |
| `src/lib/site-schema.ts` | JSON-LD builders: sitewide graph, breadcrumbs, FAQ, per-route graph |
| `src/lib/site-pages.ts` | Every indexable path (routes, quiz, blog, posts) + `isInternalPage()` |
| `src/components/ui/*` | shadcn components (`components.json`, new-york) mapped onto the brand tokens via `@theme inline` |
| `src/lib/media-sync.ts` + `scripts/media-sync.mjs` | Copy jobs `assets/* → public/media/*` (Node, no rsync) |
| `src/lib/media-sync.ts` + `scripts/optimize-hero-video.mjs` | ffmpeg jobs for the 16x9 / 9x16 hero loops |
| `docs/scroll-world-brief.md` | The creative brief the homepage is scored against |

## Scroll world (homepage)

Six acts, no motion device repeated back to back, one peak. Defined in
`src/content/site.ts` and rendered by `ScrollWorld`:

| Act | Device | Content |
|---|---|---|
| Arrival | parallax | Silent hero loop (trimmed from the sister clinic's clip) under "Stop living around your teeth. Start living again." |
| Trust | kinetic | Team photo + "Twenty years of renewing Ottawa smiles" + CDCP/financing note |
| Choice | rail (desktop pinned; touch scroll-snap) | Implant-anatomy card (the assembling-implant loop) then four treatment cards — All-on-4, full arch, snap-on, sedation — each playing its own silent loop over its service photo |
| Connection | split | Tom Szarski portrait clip-path reveal + a verified review |
| Proof (peak) | panorama | Sticky copy with the three-step process; four parallax photo tiles |
| Commitment | iris | Circle reveal into the free-consultation CTA + phone |

A single SVG "arch line" is stroke-drawn by scroll progress across the whole page.
`prefers-reduced-motion` gets settled compositions, a native overflow rail, and
no video.

Responsive behavior is tested down to 320 CSS px. The full desktop navigation
switches to the 44 px mobile menu at 900 px (and on coarse pointers), two-column
content reflows at 800 px, and the hero actions stack at 480 px. Fixed-header
height and page offsets include `safe-area-inset-top`; every page exposes the
same keyboard skip target. Cards, tables, CTAs, and long article text are allowed
to shrink or wrap instead of widening the document.

## Inner pages

Two grammars, chosen per route in `src/content/routes.ts`:

- **experience** (14 routes: the eight services, meet-your-dentist, why-choose-us,
  what-to-expect, patient-stories, before-after, dental-anxiety) — 2–3 `acts`, each
  with its own device (`parallax | kinetic | rail | split | panorama | iris`), then
  body sections, verified quotes, FAQs, and next-step buttons.
- **document** (9 routes: contact-us, pricing, faq, service-areas,
  easy-implant-en, for-dentists, privacy-policy, terms, sitemap) — content hero,
  hours/map on contact, sections, FAQs, and next-step buttons.

Service pages add a quiz call to action under their next-step buttons.

Legacy URLs `/home`, `/services`, `/about`, `/easy-implant` redirect via
`next.config.ts` from `getRouteAliases()`.

The five implant-placement services (`all-on-4-dental-implants`,
`full-arch-dental-implants`, `same-day-dental-implants`, `upper-jaw-implants`,
`lower-jaw-implants`) open on the generated implant-assembly loop
(`implantAnimation` in `src/content/site.ts`, spread into the first act via
`RouteAct.video/webm/mobileVideo/mobileWebm/poster/mobilePoster`). The spec in
`src/content/routes.test.ts` enforces this.

## Blog

Posts are MDX files in `content/blog/`, loaded by `src/lib/blog.ts` (gray-matter +
zod frontmatter; posts dated in the future stay hidden) and compiled with
`@mdx-js/mdx` `evaluate` in `src/components/blog/render-post-body.tsx`. MDX may use
only `<BlogCta />`, `<ExtractionTable caption columns rows />`, and
`<KeyStat value label source />`. Each post page renders the byline, table of
contents, visible FAQs (the same data as its FAQPage JSON-LD), related posts, and a
sticky quiz CTA; `src/lib/blog-schema.ts` emits MedicalWebPage + BlogPosting +
BreadcrumbList + FAQPage. `reviewedBy` / `lastReviewed` are published only when a
post names a real clinical reviewer — the five migrated posts do not yet.

Write posts with the `renew-blog-writing` skill (`.cursor/skills/`); strategy and
entity facts live in [docs/search-visibility.md](docs/search-visibility.md). After
adding a post, list it in `public/llms.txt` (a test fails until you do).

## Lead quiz

`/implant-candidate-quiz`: nine questions (`src/lib/quiz/questions.ts`) → a result
preview → a lead form → `POST /api/quiz-leads` → `/implant-candidate-quiz/thank-you?path=…&m=…`
(noindex). Built from shadcn `RadioGroup`, `Checkbox`, `Input`, `Label`, `Progress`.

- Progress resumes from `localStorage` (answers only, never contact details).
- The API validates with zod, rejects the honeypot and fills under 4 s, and
  recomputes the result path and lead score (hot ≥ 70, warm 45–69, nurture < 45)
  on the server before inserting.
- Marketing consent is unchecked by default; when ticked, the exact consent text
  and time are stored (CASL).
- Leads go to the Supabase table in
  `supabase/migrations/20260929150000_quiz_leads.sql` (RLS on, no policies;
  service-role writes only). **The migration is not applied yet** — the Supabase
  org was at its free-project limit. Apply it and set the two Supabase env vars
  before launch. Email/SMS follow-up (Resend) is out of scope here.
- Entry points: Patients menu, every service page, every blog post (UTM-tagged).
  GA4 events: `quiz_started`, `quiz_step_completed`, `quiz_result_previewed`,
  `generate_lead`, `quiz_cta_clicked`, `quiz_call_clicked`.

## Palette

Lifted from the Novadent retainer-cleaner packaging (matte black box, lime pill,
aqua wave, white ground) and set as tokens in `src/app/globals.css`:

| Token | Value | Role |
|---|---|---|
| `--canvas` / `--surface` | `#ffffff` | Page ground |
| `--surface-alt` | `#eaf7fd` | Tinted sections (trust, testimonials) |
| `--ink` / `--carbon` | `#1a1a1a` | Body type; dark sections (rail, panorama, process, footer) |
| `--ink-deep` | `#111111` | Hero/close scrims, button text |
| `--accent` | `#8dc41d` | Lime: primary button fill, labels on dark, quote rule |
| `--accent-deep` / `--accent-light` | `#5f8a0e` / `#d8f0a6` | Lime for text on white / soft tints |
| `--aqua` | `#009ce3` | Arch line, primary button hover |
| `--aqua-deep` | `#006ca6` | AA aqua for small text on white and pale-blue surfaces (labels, wordmark caps, links, phone) |
| `--aqua-light` / `--aqua-pale` | `#85d4f2` / `#bfebf6` | Hero accent word, ghost-button underline |

Rule of thumb: lime on black, aqua on white, never lime on white for small text.

Content decisions worth knowing:

- No logo file was ever served by the original site, so the wordmark is typed
  (`BrandMark`) and the favicon is `src/app/icon.svg`.
- The before-and-after gallery photos were never recoverable (CDN 404s), so
  `/before-after` restores the four cases as described sections instead of empty
  images. The spec enforces this.
- The 52 MB interview video is kept locally under `assets/video/` but is
  gitignored and not shipped.

## Media

`assets/` is the source of truth. `predev` / `prebuild` run `scripts/media-sync.mjs`,
which copies:

| From | To |
|---|---|
| `assets/heroes` | `public/media/heroes` |
| `assets/interiors` | `public/media/interiors` |
| `assets/staff` | `public/media/staff` |
| `assets/other` | `public/media/services` |
| `assets/video/optimized/*.mp4` | `public/media/video` |
| `assets/implant-animation` (six files only, see below) | `public/media/animation` |
| `assets/treatment-animation` (web renders only) | `public/media/treatments` |

`public/media/` is gitignored and rebuilt on every install/build (Vercel-safe).

The implant animation folder holds every render from the generation run; only the
web deliverables ship: `implant-assemble-web-{16x9,9x16}.{mp4,webm}` (8 s, silent,
`+faststart`, 1280x720 / 720x1280) plus the posters
`dental-implant-angled-{16x9,9x16}.png`. The allow-list is `implantAnimationFiles`
in `src/lib/media-sync.ts`, which is imported by `scripts/media-sync.mjs`; missing
allow-listed files fail `predev` / `prebuild` instead of producing broken public
URLs. The loop is rendered on a light studio ground, so it is always framed (rail
card, chapter photo panel) rather than placed full-bleed under white type.

The treatment-card loops follow the same rule: `assets/treatment-animation` keeps the
8 s Omni masters (with audio), and only `treatment-{allon4,fullarch,snapon,sedation}-web-{16x9,9x16}.{mp4,webm}`
ship (allow-list `treatmentAnimationFiles`). Posters are the existing service photos.
All 16 landscape/portrait WebM/MP4 treatment sources are present. Browsers receive
portrait posters and sources on small screens; videos use `preload="none"` and play
only while intersecting the viewport, then pause offscreen. Reduced-motion users
keep the poster and never start a loop.

The hero loops are committed in `assets/video/optimized/` and derived by
`npm run media:hero` from `assets/video/orleans-homepage-hero.mp4`, using only
seconds 7–15 (the sister clinic's reception sign is on screen outside that window).
Output: `renew-hero-16x9.mp4` (1280x720, ~330 KB) and `renew-hero-9x16.mp4`
(720x1280, ~280 KB), silent, `+faststart`.

## Tests

Vitest specs live beside their modules and act as the content contract:

- `src/content/site.test.ts` — six acts, one peak, no adjacent device repeat, NAP, header links, hero video only on arrival.
- `src/content/nav.test.ts` — parents, ordered service children, aliases resolve.
- `src/content/routes.test.ts` — the exact 23-slug inventory, grammar tags, media references, FAQ shape, verified reviews, every internal link resolves (`isInternalPage`).
- `src/lib/media-sync.test.ts` — copy jobs, mp4 filter, hero loop trim window.
- `src/lib/site-schema.test.ts` — sitewide graph, Tom as denturist, breadcrumbs, FAQPage only when questions exist, MedicalWebPage for services.
- `src/lib/blog.test.ts`, `src/lib/blog-schema.test.ts`, `src/lib/blog-rss.test.ts`, `src/components/blog/blog-mdx.test.tsx` — frontmatter, the post skeleton, clinical/compliance guards (no prices, no "Dr. Tom", no "guarantee"), related posts, schema, RSS, and every post compiling.
- `src/lib/quiz/*.test.ts`, `src/app/api/quiz-leads/route.test.ts`, `src/components/quiz/quiz-flow.test.tsx` — questions, result paths, scoring, lead validation, row mapping, API responses, and the full quiz flow in jsdom.
- `src/lib/site-pages.test.ts`, `src/app/{robots,sitemap}.test.ts`, `src/lib/{indexnow,analytics,utm,site-verification}.test.ts` — crawl surface, llms.txt links, and tracking helpers.
- `src/lib/scroll-motion.test.ts` — rail distance and image motion maths.
- `src/components/{scroll-world,loop-video}.test.tsx` — hero consultation/quiz CTAs, UTM tracking, responsive poster selection, deferred loading, and visibility-aware playback.

## Salvage pack

Scraped from [https://www.renewimplants.ca](https://www.renewimplants.ca/) for a clean rebuild handoff.
Sister-site homepage hero video from [https://orleansdentureclinic.com](https://orleansdentureclinic.com/).

### Quick facts
- **Address:** 2530 St Joseph Blvd #6, Orléans, ON K1C 1G1
- **Phone:** 613-841-6111
- **Email:** info@renewimplants.ca
- **Hours:** Mon–Fri by appointment; evenings & weekends on request
- **Lead:** Tom Szarski, DD (+ Dr. Alex, implant surgeon)

### What's in the pack
| File / folder | Purpose |
|---------------|---------|
| `SITE-MAP.md` | URL inventory + nav + tech notes (+ the rebuild route table) |
| `COPY.md` + `recovered/pages/` | Clean per-page copy (moved out of `pages/` because Next.js reserves that folder) |
| `CONTACTS-NAP.md` | Phone, email, address, hours, people |
| `ASSETS-MANIFEST.md` | Downloaded images/videos + missing CDN refs |
| `SISTER-SITE-VIDEO.md` | Orleans hero video provenance |
| `assets/` | brand / staff / interiors / exteriors / heroes / other / video |
| `raw/` | HTML (+ CSS/JS) snapshots |
| `FINAL-REPORT.md` / `scrape-summary.json` | Counts, blockers, summary |
| `scrape.py` | Reproducible scraper (partial; bot wall limited) |
| `docs/specs/2026-09-29-seo-blog-lead-quiz-spec.md` | Spec: SEO/AEO/GEO blog + implant candidate quiz lead funnel |
| `docs/plans/2026-09-29-seo-blog-lead-quiz-plan.md` | Phased TDD implementation plan for the spec |

### Counts
- Pages (md): **30** · Asset files: **11** · Breakdown: {'staff': 2, 'interiors': 1, 'heroes': 2, 'other': 4, 'video': 2}
- Hero video present: `assets/video/orleans-homepage-hero.mp4` (1920x956, 21.8s)

### Do not
- Do not treat this as a platform migration of the SalientAI build.
- Parent agent handles CopyFromBox — this pack stays on the box under `/workspace/renewimplants/`.

## Changelog

See `CHANGELOG.md`.
