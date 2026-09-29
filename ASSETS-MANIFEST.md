# Assets manifest — Renew Implants

Total downloaded files: **11**

## brand/ (0)

_Empty — none recovered._

## staff/ (2)

- `assets/staff/team-group.jpg` — 700x500 · 84699 bytes
  - source: https://www.renewimplants.ca/img/team-group.jpg
- `assets/staff/tom-szarski.jpg` — 800x1000 · 91331 bytes
  - source: https://www.renewimplants.ca/img/tom-szarski.jpg

## interiors/ (1)

- `assets/interiors/renew-lab.jpg` — 2390x1792 · 1697884 bytes
  - source: https://www.renewimplants.ca/img/renew-lab.jpg

## exteriors/ (0)

_Empty — none recovered._

## heroes/ (2)

- `assets/heroes/meet-hero.jpg` — 1920x800 · 162457 bytes
  - source: https://www.renewimplants.ca/img/meet-hero.jpg
- `assets/heroes/renew-hero.jpg` — 1920x800 · 178775 bytes
  - source: https://www.renewimplants.ca/img/renew-hero.jpg

## other/ (4)

- `assets/other/service-allon4.jpg` — 600x400 · 47176 bytes
  - source: https://www.renewimplants.ca/img/service-allon4.jpg
- `assets/other/service-fullarch.jpg` — 600x400 · 56558 bytes
  - source: https://www.renewimplants.ca/img/service-fullarch.jpg
- `assets/other/service-sedation.jpg` — 600x400 · 55178 bytes
  - source: https://www.renewimplants.ca/img/service-sedation.jpg
- `assets/other/service-snapon.jpg` — 1024x1024 · 117665 bytes
  - source: https://www.renewimplants.ca/img/service-snapon.jpg

## video/ (2)

- `assets/video/orleans-homepage-hero.mp4` — 1920x956 · 10921603 bytes · duration 21.8s
  - source: https://assets.webmarketers.ca/orleands-denture-clinic-homepage.mp4
- `assets/video/orleans-odc-interview.mp4` — 1920x1080 · 52501492 bytes · duration 67.7s
  - source: https://assets.webmarketers.ca/odc-interview.mp4

## implant-animation/ (12) — generated, not scraped

Exploded-view dental implant (crown, retaining screw, abutment, fixture) animated with Gemini Omni Flash (`gemini-omni-flash-preview`, image-to-video, 8s loop: parts hover apart → assemble → hold → separate back to the first frame). Chain + key live in `~/Desktop/ClaudeSkills` (`.env.local` `GEMINI_API_KEY`, `skills/community/openmontage/tools/video/gemini_omni_video.py`).

- `assets/implant-animation/implant-assemble-16x9.mp4` — 1280x720 · 8.0s · with ambient audio · desktop
- `assets/implant-animation/implant-assemble-9x16.mp4` — 720x1280 · 8.0s · with ambient audio · mobile
- `assets/implant-animation/implant-assemble-angled-16x9.mp4` — 1280x720 · 8.0s · audio · assembles while staying on the diagonal
- `assets/implant-animation/implant-assemble-angled-9x16.mp4` — 720x1280 · 8.0s · audio · stays mostly diagonal (slight straightening when assembled)
- `assets/implant-animation/implant-assemble-slow16s-16x9.mp4` — 1280x720 · 16.0s · half-speed, motion-interpolated (ffmpeg `minterpolate`) from the 8s clip
- `assets/implant-animation/implant-assemble-slow16s-9x16.mp4` — 720x1280 · 16.0s · half-speed, motion-interpolated
- `assets/implant-animation/implant-assemble-web-16x9.mp4` / `.webm` — silent, `faststart` H.264 (~0.8 MB) + VP9 (~0.3 MB) for `<video autoplay muted loop playsinline>`
- `assets/implant-animation/implant-assemble-web-9x16.mp4` / `.webm` — silent mobile equivalents
- `assets/implant-animation/dental-implant-angled-16x9.png` — first-frame still / poster for desktop
- `assets/implant-animation/dental-implant-angled-9x16.png` — first-frame still / poster for mobile

## treatment-animation/ (24) — generated, not scraped

Homepage rail treatment cards, animated from the `other/service-*.jpg` photos with Gemini Omni Flash (image-to-video, 8s loops, $0.80 each, $6.40 total).

- `assets/treatment-animation/treatment-{allon4,fullarch,snapon,sedation}-{16x9,9x16}.mp4` — 8 masters · 1280x720 / 720x1280 · with ambient audio
- `assets/treatment-animation/treatment-{allon4,fullarch,snapon,sedation}-web-{16x9,9x16}.{mp4,webm}` — 16 silent `faststart` H.264 (~1.0–1.4 MB) + VP9 (~0.5–0.9 MB) web renders, synced to `public/media/treatments`
- Notes: portrait All-on-4 pulls the background dentist into focus; portrait full-arch has more camera drift than the landscape cut.

## Referenced but NOT downloadable (soft HTML / missing on CDN)

- `/img/allon4-diagram.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/allon4-hero.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/ba-allon4-01-after.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/ba-allon4-01-before.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/ba-allon4-02-after.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/ba-allon4-02-before.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/ba-fullarch-01-after.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/ba-fullarch-01-before.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/ba-snapon-01-after.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/ba-snapon-01-before.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/before-after-hero.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/blog-hero.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/contact-hero.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/dental-anxiety-hero.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/denture-alt-hero.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/expect-consult.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/expect-hero.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/failed-work-hero.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/faq-hero.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/fullarch-hero.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/fullarch-options.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/lower-jaw-diagram.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/lower-jaw-hero.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/patient-stories-hero.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/pricing-hero.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/renew-clinic.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/sameday-hero.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/sameday-timeline.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/sedation-comfort.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/sedation-hero.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/service-areas-hero.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/snapon-diagram.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/tom-consultation.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/upper-jaw-diagram.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/upper-jaw-hero.jpg` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)
- `/img/young-man-with-toothy-smile-demonstrating-his-dental-implant.webp` — referenced in HTML; returns bot interstitial / missing file (~11–12KB text/html)

## Notes
- Before/after gallery markup exists (`ba-*-before/after.jpg`) but image files are not served yet
- Many page hero images (`*-hero.jpg`) similarly missing on CDN
- No brand logo file found; wordmark is HTML/CSS text
