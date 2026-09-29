# Final report — Renew Implants salvage

**Scraped at:** 2026-09-29T10:00:32-04:00 (America/Toronto)
**Primary site:** https://www.renewimplants.ca
**Sister video source:** https://orleansdentureclinic.com

## Success metrics
- Pages OK (md): **30**
- Raw HTML good snapshots: **24**
- Asset files downloaded: **11**
- Asset breakdown: `{'staff': 2, 'interiors': 1, 'heroes': 2, 'other': 4, 'video': 2}`
- Hero video present: **True** → `assets/video/orleans-homepage-hero.mp4`
- NAP: 613-841-6111 · info@renewimplants.ca · 2530 St Joseph Blvd #6, Orléans, ON K1C 1G1

## Blockers / notes
- SalientAI/Cloudflare bot interstitial ('One moment, please...') rate-limits unauthenticated crawls; many inner pages required paced cookie-jar retries or WebFetch fallback
- 36 /img/* paths referenced in HTML return soft HTML (~11–12KB) instead of image bytes — appear not uploaded yet (placeholders): allon4-diagram.jpg, allon4-hero.jpg, ba-allon4-01-after.jpg, ba-allon4-01-before.jpg, ba-allon4-02-after.jpg, ba-allon4-02-before.jpg, ba-fullarch-01-after.jpg, ba-fullarch-01-before.jpg, ba-snapon-01-after.jpg, ba-snapon-01-before.jpg, before-after-hero.jpg, blog-hero.jpg, contact-hero.jpg, dental-anxiety-hero.jpg, denture-alt-hero.jpg, expect-consult.jpg, expect-hero.jpg, failed-work-hero.jpg, faq-hero.jpg, fullarch-hero.jpg…
- Directory indexes (/img/, favicon probes) return bot interstitial HTML
- No logo SVG/PNG found at common paths (logo rendered as text/CSS in nav)
- No Renew-hosted mp4/webm — hero is still image; sister Orleans video salvaged instead
- Hours listed as 'Monday – Friday: By appointment; Evenings & weekends available on request' (contact page) — not full weekly grid

## Method notes
- robots.txt → sitemap.xml (28 locs)
- Paced curl + cookie jar recovered most HTML; remainder via WebFetch markdown
- Images: only 9 Renew JPEGs actually served; ~25+ /img refs are placeholders
- Orleans Elementor hero MP4 + interview MP4 downloaded from assets.webmarketers.ca
