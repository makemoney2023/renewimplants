# Site map — Renew Implants

**Primary:** https://www.renewimplants.ca/
**Also:** https://renewimplants.ca/ (same content)
**Sister:** https://orleansdentureclinic.com/ (hero video source)

## Rebuild routes (current)

The Next.js rebuild (`src/app`) publishes the homepage, 23 content routes defined in
`src/content/routes.ts` (locked by `src/content/routes.test.ts`, served by the
`[...slug]` catch-all), plus dedicated App Router pages for the blog and the lead quiz.
`/sitemap.xml` lists all of them via `getIndexablePaths()` in `src/lib/site-pages.ts`.

| Route | Grammar | Notes |
|---|---|---|
| `/` | scroll world | six acts, `src/content/site.ts` |
| `/services/all-on-4-dental-implants` | experience | kinetic → split → iris |
| `/services/full-arch-dental-implants` | experience | |
| `/services/same-day-dental-implants` | experience | |
| `/services/denture-alternative` | experience | |
| `/services/upper-jaw-implants` | experience | |
| `/services/lower-jaw-implants` | experience | |
| `/services/sedation-dentistry` | experience | |
| `/services/failed-dental-work` | experience | |
| `/meet-your-dentist` | experience | Tom Szarski split portrait |
| `/why-choose-us` | experience | kinetic → panorama (photos) → iris |
| `/what-to-expect` | experience | parallax → kinetic → split; three-step process |
| `/patient-stories` | experience | all ten verified reviews |
| `/before-after` | experience | four described cases (photos unrecoverable) |
| `/dental-anxiety` | experience | sedation options |
| `/contact-us` | document | hours, map link, tel/mailto actions, FAQ |
| `/pricing` | document | CDCP, direct billing, financing |
| `/faq` | document | 18 questions, FAQPage JSON-LD |
| `/service-areas` | document | Orléans + Ottawa-region coverage |
| `/blog` | `src/app/blog` | Blog + ItemList JSON-LD; posts from `content/blog/*.mdx` |
| `/blog/why-people-are-choosing-all-on-4` | `src/app/blog/[slug]` | MedicalWebPage + BlogPosting + FAQPage |
| `/blog/dentures-vs-dental-implants` | `src/app/blog/[slug]` | |
| `/blog/same-day-dental-implants-new-teeth-one-day` | `src/app/blog/[slug]` | |
| `/blog/all-on-4-dental-implants-after-years-of-missing-teeth` | `src/app/blog/[slug]` | |
| `/blog/full-arch-vs-individual-dental-implants` | `src/app/blog/[slug]` | |
| `/blog/rss.xml` | route handler | RSS 2.0 |
| `/implant-candidate-quiz` | `src/app/implant-candidate-quiz` | lead quiz + FAQ + WebPage JSON-LD |
| `/implant-candidate-quiz/thank-you` | same | noindex; result from `?path=&m=` |
| `/easy-implant-en` | document | |
| `/for-dentists` | document | referral page |
| `/privacy-policy` | document | |
| `/terms` | document | |
| `/sitemap` | document | renders the nav tree |

Redirects (`next.config.ts` ← `getRouteAliases()`): `/home → /`,
`/services → /services/all-on-4-dental-implants`, `/about → /meet-your-dentist`,
`/easy-implant → /easy-implant-en`.

Header nav (`src/content/nav.ts`): Services (8) · About (5) · Patients (6, incl. the quiz) ·
Blog (5) · Contact (2), plus phone and "Free consultation" CTA.

## Tech stack
- Custom static/marketing front-end (comment in HTML: `Powered by https://salientai.ca`)
- Assets: `/assets/styles.css`, `/assets/scripts.js`, `/img/*`
- Fonts: DM Serif Display + Plus Jakarta Sans (Google Fonts)
- Analytics: Google Tag Manager `G-YZG16B3H0V`
- Call tracking: CallRail
- Forms: HighLevel / msgsndr (`link.msgsndr.com/js/form_embed.js`)
- CDN/security: Cloudflare + SalientAI bot interstitial on aggressive crawl
- Sister site: WordPress + Elementor; video CDN `assets.webmarketers.ca`

## Primary navigation (homepage)
- Home `/`
- Services: All-on-4, Same Day, Upper Jaw, Lower Jaw, Sedation, Full Arch, Denture Alternative, Failed Dental Work
- What to Expect `/what-to-expect/`
- Before & After `/before-after/`
- Meet Your Dentist `/meet-your-dentist/`
- Why Choose Us `/why-choose-us/`
- Scared of the Dentist? `/dental-anxiety/`
- Blog `/blog/`
- Patient Stories `/patient-stories/`
- Pricing `/pricing/`
- Easy Implant `/easy-implant-en/`
- For Dentists `/for-dentists/`
- Contact Us `/contact-us/`


## Sitemap.xml (28 locs)
- https://www.renewimplants.ca/
- https://www.renewimplants.ca/contact-us/
- https://www.renewimplants.ca/pricing/
- https://www.renewimplants.ca/meet-your-dentist/
- https://www.renewimplants.ca/why-choose-us/
- https://www.renewimplants.ca/what-to-expect/
- https://www.renewimplants.ca/patient-stories/
- https://www.renewimplants.ca/before-after/
- https://www.renewimplants.ca/dental-anxiety/
- https://www.renewimplants.ca/faq/
- https://www.renewimplants.ca/service-areas/
- https://www.renewimplants.ca/services/all-on-4-dental-implants/
- https://www.renewimplants.ca/services/full-arch-dental-implants/
- https://www.renewimplants.ca/services/same-day-dental-implants/
- https://www.renewimplants.ca/services/denture-alternative/
- https://www.renewimplants.ca/services/upper-jaw-implants/
- https://www.renewimplants.ca/services/lower-jaw-implants/
- https://www.renewimplants.ca/services/sedation-dentistry/
- https://www.renewimplants.ca/services/failed-dental-work/
- https://www.renewimplants.ca/blog/
- https://www.renewimplants.ca/blog/why-people-are-choosing-all-on-4/
- https://www.renewimplants.ca/blog/dentures-vs-dental-implants/
- https://www.renewimplants.ca/blog/same-day-dental-implants-new-teeth-one-day/
- https://www.renewimplants.ca/blog/all-on-4-dental-implants-after-years-of-missing-teeth/
- https://www.renewimplants.ca/blog/full-arch-vs-individual-dental-implants/
- https://www.renewimplants.ca/privacy-policy/
- https://www.renewimplants.ca/terms/
- https://www.renewimplants.ca/sitemap/

## Pages in this pack

- `https://www.renewimplants.ca/` — All-on-4 Dental Implants Ottawa | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/before-after/` — Before & After Gallery | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/blog/` — Blog | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/blog/all-on-4-dental-implants-after-years-of-missing-teeth/` — Can You Get All-on-4 Dental Implants After Years of Tooth Loss? | Renew Implants _(source: webfetch)_
- `https://www.renewimplants.ca/blog/dentures-vs-dental-implants/` — Dentures vs. Dental Implants: Which Is Right for You? | Renew Implants Ottawa | Renew Impl _(source: html)_
- `https://www.renewimplants.ca/blog/full-arch-vs-individual-dental-implants/` — Full-Arch vs Individual Dental Implants | Renew Implants Ottawa | Renew Implants _(source: webfetch)_
- `https://www.renewimplants.ca/blog/same-day-dental-implants-new-teeth-one-day/` — Same-Day Dental Implants: Can You Get New Teeth in One Day? | Renew Implants Ottawa | Rene _(source: webfetch)_
- `https://www.renewimplants.ca/blog/why-people-are-choosing-all-on-4/` — Why People Are Choosing All-on-4 Dental Implants | Renew Implant Centre | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/contact-us/` — Contact Us | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/dental-anxiety/` — Scared of the Dentist? | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/easy-implant-en/` — Easy Implant — Renew Implant Centre _(source: webfetch)_
- `https://www.renewimplants.ca/faq/` — Dental Implant FAQ | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/for-dentists/` — For Dentists — Renew Implant Centre _(source: webfetch)_
- `https://www.renewimplants.ca/meet-your-dentist/` — Meet Your Dentist | Tom Szarski, DD | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/patient-stories/` — Patient Stories & Reviews | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/pricing/` — Dental Implant Pricing & Financing | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/privacy-policy/` — Privacy Policy | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/service-areas/` — Service Areas | Renew Implant Centre — Orléans, Ottawa | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/services/all-on-4-dental-implants/` — All-on-4 Dental Implants Ottawa | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/services/denture-alternative/` — Denture Alternative Ottawa | Snap-On Dentures | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/services/failed-dental-work/` — Failed Dental Work Ottawa | Fix Broken Implants | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/services/full-arch-dental-implants/` — Full Arch Dental Implants Ottawa | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/services/lower-jaw-implants/` — Lower Jaw Implants Ottawa | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/services/same-day-dental-implants/` — Same Day Dental Implants Ottawa | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/services/sedation-dentistry/` — Sedation Dentistry Ottawa | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/services/upper-jaw-implants/` — Upper Jaw Implants Ottawa | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/sitemap/` — Sitemap | Renew Implants _(source: webfetch)_
- `https://www.renewimplants.ca/terms/` — Terms of Use | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/what-to-expect/` — What to Expect | Dental Implant Consultation Ottawa | Renew Implants _(source: html)_
- `https://www.renewimplants.ca/why-choose-us/` — Why Choose Renew Implant Centre | Dental Implants Orléans, ON | Renew Implants _(source: html)_

**Page markdown files:** 30
