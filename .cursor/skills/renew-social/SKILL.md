---
name: renew-social
description: Produce Renew Implant Centre Instagram, Facebook, and Meta video ads from the social catalog. Locks every frame to the Renew design system (tokens, wordmark, end card) and the clinic compliance rules. Use when drafting, filming, or reviewing social posts, Reels, carousels, Stories, or paid dental-implant video ads.
---

# Renew social and paid video

Blog posts still follow [renew-blog-writing](../renew-blog-writing/SKILL.md). This skill is for Instagram, Facebook, and Meta video.

The catalog is `docs/content/social/`. Entity facts and locked claims stay in [docs/search-visibility.md](../../../docs/search-visibility.md).

## Design system, every time

1. Read `docs/content/social/design-system.json` before writing a frame, a prompt, or a caption.
2. Colors are token names (`accent`, `carbon`, `aqua-deep`, …). The hex values are copied from `:root` in `src/app/globals.css`. If the CSS changes, update the JSON in the same change. Do not invent a green, a blue, or a gold.
3. Type is DM Serif Display (headlines, weight 400) and Plus Jakarta Sans (labels and body). The wordmark is the word `renew` in the serif and `implants` in small caps. There is no logo file. Do not draw a tooth icon in its place.
4. Light grounds use aqua eyebrows. Dark grounds use lime eyebrows. The CTA is always a fully rounded lime pill with near-black text.
5. A single thin aqua arch stroke is allowed. It reads as a jaw curve, not a logo.
6. Every video’s last 2.5 seconds is layout `video-end-card`. Call `buildPromptPrefix()` from `src/lib/social-pipeline.ts` for any generated frame. Clinic stills must be paths in `approvedMedia`.

## Produce one unit

1. Pick a `ready` unit from `ads.json` (paid) or `organic-calendar.json` (feed). Skip anything that needs a signed social release.
2. Speak the unit’s `hook`, `body`, and `onScreen` lines. Do not paste the original Gemini hook back in.
3. The click goes to `ctaHref` (the implant quiz, about two minutes, nine questions). The phone `613-841-6111` can be spoken. It is not a second price offer.
4. If `testimonialName` is set, the words must stay a verbatim excerpt of that review in `src/content/testimonials.ts`. Do not show that person’s face.
5. `concept-denture-slip` is a generated older adult with lived-in skin, wrinkles, and laugh lines. No name, no blood, no needles, no extra facial or hand features. The end card is still the design system.
6. Cross-posting follows `distribution.json`. Do not invent a third clinic, a new domain, or a city price page.

## Gate

```bash
npx vitest run src/lib/social-pipeline.test.ts
```

The test fails if a unit leaves the palette, quotes a price, calls Tom Szarski “Dr.”, says guarantee, or names a patient who is not in the review file.
