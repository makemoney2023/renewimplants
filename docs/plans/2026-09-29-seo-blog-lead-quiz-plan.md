# Implementation plan — SEO/AEO/GEO blog + implant lead-gen quiz

**Date:** 2026-09-29
**Spec:** [../specs/2026-09-29-seo-blog-lead-quiz-spec.md](../specs/2026-09-29-seo-blog-lead-quiz-spec.md)
**Sequence (agreed):** foundation + technical SEO → quiz + Supabase leads → blog port → content program → measurement
**Follow-up (separate plan):** Resend email/SMS follow-up on `quiz_leads`

Every task follows the loop: write failing test → implement → wire end-to-end → `npm test && npm run lint && npm run typecheck` → update docs. Before writing Next.js code, read the matching guide in `node_modules/next/dist/docs/` (Next 16.3 has breaking changes; see `AGENTS.md`). Look up library docs (fumadocs, shadcn, Supabase) with Context7/Firecrawl first.

PIRX paths below are relative to `/Users/cbsuperpatch/Desktop/Projects/PIRX/pirx-frontend/`.

---

## Phase 0 — Baseline and foundation

| # | Task | Files | Done when |
|---|---|---|---|
| 0.1 | Coordinate with the other session editing this tree; agree on who owns `src/app/*` | — | Owner agreed |
| 0.2 | Initial commit of the current tree (only when the user asks) so this work has a clean diff base | git | `git log` shows a base commit |
| 0.3 | Run baseline: `npm test`, `npm run lint`, `npm run typecheck`; record results | — | Baseline recorded (green, or red with known failures) |
| 0.4 | Initialize shadcn for Tailwind v4 (`components.json`); reconcile with the existing `src/components/ui/button.tsx`; add `radio-group`, `checkbox`, `input`, `label`, `form`, `progress`, `card` | `components.json`, `src/components/ui/*` | Existing pages render unchanged; lint clean |
| 0.5 | Component test setup: `@testing-library/react` + `jsdom`; jsdom for `*.test.tsx` only, node for everything else | `vitest.config.ts`, `package.json` | One sample component test passes |
| 0.6 | Env contract: `NEXT_PUBLIC_SITE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_GA_ID`, `INDEXNOW_KEY`, `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`. Values come from Obsidian, never hardcoded | `.env.example` | File exists, README links it |

---

## Phase 1 — Technical SEO foundation (port from PIRX)

| # | Test first | Implement | PIRX source |
|---|---|---|---|
| 1.1 | `src/lib/site-schema.test.ts`: sitewide graph has `Dentist`, `WebSite`, `Person` (Tom, jobTitle "Denturist") with stable `@id`s; all URLs absolute | Refactor `src/lib/site-schema.ts` → `buildSiteGraph()` (`@graph`); inject once in `src/app/layout.tsx` | `src/lib/site-schema.ts`, `site-author.ts` |
| 1.2 | Test: `buildRouteGraph(page)` returns one `@graph` with WebPage (or MedicalWebPage for service pages) + BreadcrumbList + FAQPage (when FAQs exist) referencing `#practice` / `#website` | New builder in `site-schema.ts`; replace the separate scripts in `src/app/[...slug]/page.tsx` | `blog-schema.ts` pattern |
| 1.3 | Test: every FAQ in route schema is also rendered visibly (`faq-list.tsx` receives the same array) | Wire if any gap | — |
| 1.4 | `src/app/robots.test.ts`: AI bots allowed, Bytespider/CCBot blocked, `/api/` + thank-you disallowed, sitemap declared | `src/app/robots.ts` | `src/app/robots.ts` |
| 1.5 | `src/app/sitemap.test.ts`: includes every `getRouteSlugs()` slug + home; excludes thank-you | `src/app/sitemap.ts` (blog + quiz added in later phases, tests extended then) | `src/app/sitemap.ts` |
| 1.6 | `src/lib/indexnow.test.ts`: payload shape, key location, host | `src/lib/indexnow.ts`, `scripts/submit-indexnow.mjs`, `public/<key>.txt` | `src/lib/indexnow.ts`, `scripts/submit-indexnow.mjs` |
| 1.7 | `src/lib/analytics.test.ts`: `track()` no-ops without `gtag`; event names are a closed set | `src/lib/analytics.ts` (`FUNNEL_EVENTS`); GA4 via GTM in layout; `verification` in root metadata | `src/lib/analytics.ts`, `lib/site-verification.ts` |
| 1.8 | — | `public/llms.txt` (site summary + key URLs) | `public/llms.txt` |

**Phase 1 exit:** view-source on `/` and a service page shows one sitewide graph + one page graph; `/robots.txt` and `/sitemap.xml` render; Rich Results Test passes on 3 URLs.

---

## Phase 2 — Implant candidate quiz + Supabase leads

### 2A. Data layer

| # | Task | Files |
|---|---|---|
| 2.1 | Supabase project (Q3 in spec; Canadian region). Migration `quiz_leads` per spec §9: RLS on, no policies, index on `created_at desc` and `lead_tier` | `supabase/migrations/<ts>_quiz_leads.sql` (apply via Supabase CLI/MCP after review) |
| 2.2 | Server-only Supabase client using the service-role key; throws if env is missing | `src/lib/supabase-server.ts` |

### 2B. Pure logic (test first, 100% of branches)

| # | Tests | Implement |
|---|---|---|
| 2.3 | `src/lib/quiz/questions.test.ts`: 9 questions, unique ids, option ids unique per question, `health` is skippable, `answersVersion === "v1"` | `src/lib/quiz/questions.ts` (config drives the UI) |
| 2.4 | `src/lib/quiz/result.test.ts`: each `situation` maps to its path; modifiers (`sedation`, `upper`/`lower`, `coverage`, `health-note`, `travel`) trigger correctly; every linked href exists in `getRouteSlugs()` or blog slugs | `src/lib/quiz/result.ts` → `getResultPath(answers)` |
| 2.5 | `src/lib/quiz/score.test.ts`: boundary cases at 44/45 and 69/70; researching + far away = nurture; ASAP + many teeth + CDCP + Orléans = hot | `src/lib/quiz/score.ts` → `scoreLead(answers, preferredContact)` |
| 2.6 | `src/lib/quiz/lead-schema.test.ts`: zod rejects bad email/phone, unknown option ids, missing required answers; strips unknown keys; honeypot must be empty | `src/lib/quiz/lead-schema.ts` |

### 2C. API route

| # | Tests (Supabase mocked) | Implement |
|---|---|---|
| 2.7 | `src/app/api/quiz-leads/route.test.ts`: 201 `{ id, resultPath, modifiers, leadTier }` on valid body; 400 `{ error, fields }` on invalid; 400 when honeypot filled or submitted faster than the minimum time; 500 `{ error }` on insert failure (no internal details leaked) | `src/app/api/quiz-leads/route.ts`: `POST`, validate → recompute path and score **server-side** (never trust client score) → insert → respond |

### 2D. UI (shadcn components)

| # | Tests (`*.test.tsx`, jsdom) | Implement |
|---|---|---|
| 2.8 | Stepper: renders question 1; single-select advances; multi-select needs Continue; Back works; progress updates; optional question can be skipped; answers restored from `localStorage` | `src/components/quiz/quiz-flow.tsx`, `quiz-question.tsx`, `quiz-progress.tsx` |
| 2.9 | Preview shows path title from `getResultPath`; gate form validates inline; consent unchecked by default; submit posts the exact API shape; error state shows retry + phone number | `quiz-result-preview.tsx`, `quiz-lead-form.tsx` |
| 2.10 | UTM capture: first-touch UTMs + landing path saved on first page view, attached to submit | `src/lib/utm.ts` (+ test), called from the root layout client island |
| 2.11 | Analytics: `quiz_started`, `quiz_step_completed`, `quiz_result_previewed`, `generate_lead`, `quiz_call_clicked` fire once each at the right moment | Calls in the quiz components |

### 2E. Pages and entry points

| # | Task | Files |
|---|---|---|
| 2.12 | Quiz page: server-rendered answer-first content, extraction table, visible FAQ, sources, reviewer byline + quiz island. Metadata (title ≤ 60, description 150–160, canonical, OG). `@graph`: MedicalWebPage + FAQPage + BreadcrumbList. Test the graph builder | `src/app/implant-candidate-quiz/page.tsx`, `src/lib/quiz/quiz-schema.ts` (+ test) |
| 2.13 | Thank-you page: reads `path` + modifiers from the query string, renders full plan sections + CTAs + related posts; `robots: { index: false }`; test that an unknown path falls back to a generic plan | `src/app/implant-candidate-quiz/thank-you/page.tsx` |
| 2.14 | `QuizCta` component (test: href carries UTM for the placement). Render on all `services/*` pages and as the homepage secondary CTA | `src/components/quiz-cta.tsx`; wire in `experience-page.tsx` / `document-page.tsx` and `src/content/site.ts` |
| 2.15 | Add quiz page to `sitemap.ts` + `llms.txt`; add to nav/footer | `src/app/sitemap.ts`, `src/content/nav.ts`, `site-footer.tsx` |
| 2.16 | Privacy policy: quiz data section (content in `routes.ts` → `privacy-policy`), after clinic approval (Q5) | `src/content/routes.ts` |

**Phase 2 exit:** in the local browser, a full quiz run from a service page CTA creates a `quiz_leads` row with correct answers, score, tier, and UTMs; the thank-you page shows the matching plan; GA4 DebugView shows the 5 events.

---

## Phase 3 — Blog port (fumadocs-mdx)

| # | Test first | Implement | PIRX source |
|---|---|---|---|
| 3.1 | — | Add `fumadocs-mdx` + `fumadocs-core` (versions confirmed against Next 16.3 docs); `source.config.ts` with the spec §6.2 schema; Next config plugin | `source.config.ts`, `next.config.*` |
| 3.2 | `src/lib/blog.test.ts`: posts sorted, future `datePublished` hidden, ≥ 3 FAQs, author/reviewer keys resolve, **no price figures** (`/\$\s?\d/`), no "Dr. Szarski", related posts never return self and cover every post | `src/lib/blog-source.ts`, `src/lib/blog.ts` | `src/lib/blog.ts`, `blog-related*.test.ts` |
| 3.3 | `src/lib/blog-schema.test.ts`: post graph has MedicalWebPage (`reviewedBy`, `lastReviewed`), BlogPosting, FAQPage, BreadcrumbList; index graph has Blog + ItemList | `src/lib/blog-schema.ts` | `src/lib/blog-schema.ts` |
| 3.4 | Component tests: `BlogCta` (quiz href + UTM + event), `StickyQuizCta`, `ExtractionTable` (real `<table>`), `KeyStat` (`<dl>`), `AuthorByline` (author, reviewer, updated date), `FaqSection` (visible, same data as schema), `Sources` | `src/components/blog/*` | `components/blog/*` |
| 3.5 | Route tests: `/blog/[slug]` metadata (canonical, OG article dates) + JSON-LD | `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `opengraph-image.tsx`, `src/app/blog/rss.xml/route.ts` (+ `src/lib/blog-rss.ts` test) | same paths |
| 3.6 | Update `routes.test.ts`: `blog` + 5 `blog/*` slugs removed from `routes.ts`; `/sitemap` HTML page still lists posts; `sitemap.ts` includes posts | Move the 5 posts to `content/blog/*.mdx` with the PIRX skeleton (answer first, table, CTA, question H2s, FAQ, sources). Same slugs | — |
| 3.7 | — | Manual check: all 5 old blog URLs return 200, identical paths, no redirect chains | — |

**Phase 3 exit:** `/blog`, 5 posts, RSS, and OG images work; every post has an early quiz CTA; the catch-all no longer serves blog slugs.

---

## Phase 4 — Content program

| # | Task | Files |
|---|---|---|
| 4.1 | Copy PIRX `seo-geo-aeo` skill (generic playbook) | `.cursor/skills/seo-geo-aeo/*` |
| 4.2 | Write the `renew-blog-writing` skill: frontmatter template, skeleton, locked terminology (spec §8), reviewer workflow, quality gate | `.cursor/skills/renew-blog-writing/SKILL.md` |
| 4.3 | Project `search-visibility.md` (PIRX playbook Step 0): canonical host, conversion URL = quiz, entity facts, money + cluster queries, authors | `search-visibility.md` |
| 4.4 | Content calendar (PIRX JSON format): per-post primary query, angle, FAQ seeds, cluster, internal links, reviewer | `docs/content/blog-content-calendar.json` |
| 4.5 | Wave 1 (~10 posts, 2/week, each clinically reviewed before publish), e.g.: Does CDCP cover dental implants? · Can you get implants with bone loss? · Snap-on dentures vs All-on-4 · All-on-4 recovery timeline · How long do All-on-4 implants last? · Sedation options for implant surgery · Implants with diabetes or smoking · Denturist vs dentist: who makes your implant teeth? · What's included in an all-inclusive implant quote · Failed implants: what to do next | `content/blog/*.mdx` |

The quiz page owns the "am I a candidate" query; no blog post targets it (no cannibalization).

---

## Phase 5 — Measurement and entity

| # | Task |
|---|---|
| 5.1 | GSC domain property + Bing Webmaster; submit sitemap to both; run IndexNow after each deploy |
| 5.2 | GA4 "AI Assistants" custom channel (day 1; channels don't backfill); mark `generate_lead` as a key event |
| 5.3 | Google Business Profile: quiz link with `utm_source=gbp`, services list, posts for new articles; NAP matches the `Dentist` schema |
| 5.4 | `sameAs` in the `Dentist` schema = GBP + socials (Q2) |
| 5.5 | Monthly share-of-voice check: 20 prompts across ChatGPT, Perplexity, Gemini, AI Overviews; log cited / not cited / competitor cited |
| 5.6 | 30-day baseline report on the spec §7.5 KPIs, then set targets |

---

## Documentation updates (per phase)

- `README.md`: stack, scripts, env vars, links to spec/plan/skills (Phase 0), quiz + lead table (Phase 2), blog authoring (Phase 3)
- `.env.example`: every new variable
- `CHANGELOG.md` (created in Phase 0, newest first): one entry per phase with touchpoints and verification commands
- Spec §10 answers recorded back into the spec as they arrive

## Post-plan review (required before claiming done)

Re-read the spec, diff against it, trace one lead end-to-end (blog CTA → quiz → API → Supabase row → thank-you → GA4 event), confirm no scaffolding or unused exports, full test/lint/typecheck green, docs current.
