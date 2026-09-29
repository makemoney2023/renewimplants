# Search visibility — project binding

Inputs for the [seo-geo-aeo](../.cursor/skills/seo-geo-aeo/SKILL.md) and [renew-blog-writing](../.cursor/skills/renew-blog-writing/SKILL.md) skills. Every page and post inherits these facts; change them here first.

## Canonical host and conversion

| Item | Value | Source in code |
|---|---|---|
| Canonical host | `https://www.renewimplants.ca` | `site.url` in `src/content/site.ts` |
| Primary conversion | Implant candidate quiz → lead in Supabase `quiz_leads` | `QUIZ_PATH` in `src/lib/quiz/constants.ts` |
| Secondary conversion | Phone call `613-841-6111`, free consultation `/contact-us` | `site.phone`, `site.primaryCta` |

## Entity facts (identical everywhere)

- **Name:** Renew Implant Centre (`Dentist` in JSON-LD, `src/lib/site-schema.ts`)
- **Address:** 2530 St Joseph Blvd #6, Orléans, ON K1C 1G1
- **What it does:** Full arch implants, All-on-4, same-day implants, and implant-supported dentures. A surgeon, a denturist, and an on-site lab work under one roof.
- **Author:** Tom Szarski, DD — denturist and founder (`src/content/authors.ts`). Never "Dr."

## Locked terminology and claims

- No prices anywhere in content; pricing is quoted after the consultation.
- No "guarantee" language.
- CDCP covers dentures and overdentures (with preauthorization), not most implant treatment.
- Quiz is "about two minutes, nine questions". Never promise faster.
- Only set `reviewedBy` and `lastReviewed` on a post after a real clinical review.

## Queries

- **Money query:** "all on 4 dental implants ottawa"
- **Cluster queries:** dentures vs implants · same-day implants · implants after years of missing teeth · full arch vs individual implants · CDCP and implant coverage · sedation for implant surgery · implant candidacy with diabetes or smoking

## Technical stack (where each lever lives)

| Lever | File |
|---|---|
| Sitewide `Dentist` + `WebSite` + `Person` graph | `src/app/layout.tsx` → `buildSiteGraph()` |
| Per-route `WebPage` / `MedicalWebPage` + breadcrumb + FAQ | `src/lib/site-schema.ts` → `buildRouteGraph()` |
| Blog `MedicalWebPage` + `BlogPosting` + FAQ | `src/lib/blog-schema.ts` |
| Quiz page graph | `src/lib/quiz/landing.ts` |
| Sitemap (routes, quiz, blog, posts) | `src/app/sitemap.ts` via `getIndexablePaths()` |
| robots.txt with AI-crawler allowlist | `src/app/robots.ts` |
| llms.txt (tested against real pages) | `public/llms.txt` |
| RSS | `/blog/rss.xml` |
| IndexNow (Bing / ChatGPT) | `npm run indexnow` after each deploy |
| GA4 funnel events + first-touch UTM | `src/lib/analytics.ts`, `src/lib/utm.ts` |
| Search Console / Bing verification | `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` env vars |
