# Renew Implant Centre scroll-world brief

**Status:** Self-authored from the recovered site copy (`COPY.md`,
`recovered/pages/`), the verified NAP, and the nine salvaged photographs, using
the Wilk & Wilk scroll-world grammar as the structural template.

## Interview answers

1. **Vibe:** calm, candid, established, unhurried, quietly confident. Renew's
   voice is "no runaround, no jargon" — the motion should feel the same.
2. **Journey:** arrive in the clinic, hear the twenty-year story, see what a
   fixed set of teeth actually is, meet Tom, understand that everything happens
   under one roof, book the free consultation.
3. **Energy:** slow arrival, steady reassurance, purposeful movement through the
   treatments, a quiet human pause, an expansive peak, a direct close.
4. **Feeling:** relief, trust, clarity, connection, confidence, readiness. The
   remembered moment is the clinic opening into a panorama while the three-step
   process sits still in front of it.
5. **Unique move:** one continuous arch line — read as the curve of a jaw — is
   drawn by scroll across the whole page.
6. **Range:** editorial serif headlines (DM Serif Display) on white and matte
   black, lime pills and labels on the dark acts, aqua line and labels on the
   light ones — the Novadent packaging palette. Premium but not glossy.
7. **World:** distinct photographic scenes, not a continuous camera flight.
8. **Assets:** 9 recovered photos (2 heroes, 1 interior, 2 staff, 4 service
   stills), a trimmed silent loop from the sister clinic's hero clip, a generated
   8 s implant-assembly loop (crown → screw → abutment → fixture) in 16x9 and
   9x16, verified NAP, ten verified Google reviews, and the full recovered copy
   pack. No logo file exists, so the wordmark is typed.

## Customer journey

1. **Arrival:** stop living around your teeth.
2. **Trust:** twenty years, four generations, a team that treats you like family.
3. **Choice:** what an implant actually is (the assembly loop), then All-on-4,
   full arch, snap-on dentures, sedation.
4. **Connection:** Tom listens first; Dr. Alex places; the lab is downstairs.
5. **Proof:** consultation, surgery, lab, follow-up — one roof, three steps.
6. **Commitment:** book the free consultation or call.

## Feeling curve and score

| Act | Feeling | Device | Span |
|---|---|---|---:|
| Arrival | relief | layered parallax over a silent loop | 1.7vh |
| Trust | reassurance | pinned copy assembly | 1.5vh |
| Choice | clarity | horizontal treatment rail | 2.0vh |
| Connection | warmth | split portrait reveal + review | 1.4vh |
| Proof (peak) | confidence | sticky process steps over a photo panorama | 2.8vh |
| Commitment | readiness | resolving image iris | 1.4vh |

Total: 10.8 viewport heights. Device families do not repeat consecutively
(enforced by `src/content/site.test.ts`).

## Peak

"It is the implant site where the clinic opens around you while the three steps
stay put — and you realise it all happens in one building."

## Signature move

An SVG arch line is stroke-drawn by scroll progress across the page. It is a
single aqua stroke, faint enough to read as a guide rather than decoration, and
finishes beneath the closing consultation CTA.

## Inner-page grammar

- **experience** routes reuse the same six devices as two- or three-act chapters
  (`src/content/routes.ts`), with the first act carrying the H1 and the copy
  leading on small screens.
- **document** routes are reading pages: content hero, sections, FAQs, quotes,
  next-step buttons.
- Every page with `faqs` emits FAQPage JSON-LD; every blog post is a BlogPosting.

## Accessibility and performance

- Real headings, paragraphs, links, and reading order work without JS.
- Motion uses transforms, opacity, and clip-path only.
- Reduced-motion users get settled compositions, a native overflow rail, and no
  video.
- The hero loop is trimmed to seconds 7–15 of the sister clip so the other
  clinic's reception sign never appears under the Renew wordmark; it ships at
  ~330 KB (16x9) and ~280 KB (9x16) with the still photo as poster.
- Recovered photographs are used at their native sizes inside cropped frames;
  none is stretched to full-bleed detail.
- No patient before/after photos exist in the pack, so none are faked; the
  gallery is restored as described cases.
