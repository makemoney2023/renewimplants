# Renew Implants — website salvage pack

Scraped from [https://www.renewimplants.ca](https://www.renewimplants.ca/) for a clean rebuild handoff.
Sister-site homepage hero video from [https://orleansdentureclinic.com](https://orleansdentureclinic.com/).

## Quick facts
- **Address:** 2530 St Joseph Blvd #6, Orléans, ON K1C 1G1
- **Phone:** 613-841-6111
- **Email:** info@renewimplants.ca
- **Hours:** Mon–Fri by appointment; evenings & weekends on request
- **Lead:** Tom Szarski, DD (+ Dr. Alex, implant surgeon)

## What's in this pack
| File / folder | Purpose |
|---------------|---------|
| `SITE-MAP.md` | URL inventory + nav + tech notes |
| `COPY.md` + `pages/` | Clean per-page copy |
| `CONTACTS-NAP.md` | Phone, email, address, hours, people |
| `ASSETS-MANIFEST.md` | Downloaded images/videos + missing CDN refs |
| `SISTER-SITE-VIDEO.md` | Orleans hero video provenance |
| `assets/` | brand / staff / interiors / exteriors / heroes / other / video |
| `raw/` | HTML (+ CSS/JS) snapshots |
| `FINAL-REPORT.md` / `scrape-summary.json` | Counts, blockers, summary |
| `scrape.py` | Reproducible scraper (partial; bot wall limited) |
| `docs/specs/2026-09-29-seo-blog-lead-quiz-spec.md` | Spec: SEO/AEO/GEO blog + implant candidate quiz lead funnel |
| `docs/plans/2026-09-29-seo-blog-lead-quiz-plan.md` | Phased TDD implementation plan for the spec |

## Counts
- Pages (md): **30** · Asset files: **11** · Breakdown: {'staff': 2, 'interiors': 1, 'heroes': 2, 'other': 4, 'video': 2}
- Hero video present: `assets/video/orleans-homepage-hero.mp4` (1920x956, 21.8s)

## Do not
- Do not treat this as a platform migration of the SalientAI build.
- Parent agent handles CopyFromBox — this pack stays on the box under `/workspace/renewimplants/`.
