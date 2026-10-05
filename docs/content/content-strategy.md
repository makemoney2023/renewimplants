# Content strategy — guides and blog

Working plan for Renew Implant Centre blog expansion. Source: [Gemini share](https://share.gemini.google/lq12ybZ7h43r) (“Dental Implant Content Strategy Guide”, created 2026-09-28, published 2026-10-02).

Entity facts, locked claims, and conversion URLs stay in [search-visibility.md](../search-visibility.md). Drafts follow the [renew-blog-writing](../../.cursor/skills/renew-blog-writing/SKILL.md) skill. Posts are MDX in `content/blog/`. Clusters are the five values in `BLOG_CLUSTERS` (`src/lib/blog.ts`).

## Review

The Gemini plan is a usable topic inventory. It is written for a generic single-tooth implant clinic. Use the titles below; draft them as Renew posts.

### Keep

- Hub-and-spoke: service pages and a few long guides hold the money topics; blog posts answer one patient question and link inward.
- Answer-first openings, question headings, and a direct first paragraph. That already matches the blog skeleton and AEO/GEO rules in `.cursor/skills/seo-geo-aeo/content-system.md`.
- Patient-intent categories: anxiety, cost and coverage, procedure, eligibility, comparisons, aftercare, clinic trust.
- Canada-specific coverage questions (CDCP, provincial plans, medical-expense tax treatment).

### Rewrite before any draft

| Gemini assumption | Renew rule |
|---|---|
| Publish prices, “hidden fees,” and city price guides | No dollar amounts in content. Pricing is quoted after the consultation. Cost posts explain what a quote includes and how coverage works, then send the reader to the quiz. |
| Byline is a board-certified periodontist or oral surgeon, titled “Dr.” | Author is Tom Szarski, DD, denturist and founder. Never “Dr. Szarski.” The clinic is a surgeon, a denturist, and an on-site lab under one roof. |
| CTA: “Schedule a free 3D panoramic scan” | Primary CTA is `<BlogCta />` to `/implant-candidate-quiz`. Phone `613-841-6111` and `/contact-us` are secondary. The “Why Renew” section may say the free consultation includes a 3D scan. |
| Keywords like “dental implants in [City]” and “best oral surgeon near me” | Place is Ottawa and Orléans. Money query is “all on 4 dental implants ottawa.” |
| Equal weight on single-tooth implants | Lead with full arch, All-on-4, same-day implants, and implant-supported dentures. Single-tooth topics are secondary. |
| “Guarantee,” “will not fail,” “50% of patients need a graft” | No guarantee language. Do not invent statistics. Every number needs a primary source (PubMed, canada.ca, RCDSO, CDA). |
| A blog post that owns “am I a candidate?” | The quiz page owns that query. Do not write a competing candidacy hub. |
| Downloadable PDF guides as the lead magnet | Lead capture is the quiz. PDFs are out of scope. |

### Already published (do not open a second URL)

| Gemini # | Existing post | Cluster |
|---|---|---|
| 33, 37 (same-day / immediate) | `same-day-dental-implants-new-teeth-one-day` | candidacy-recovery |
| 61, 68, 73 (dentures vs implants) | `dentures-vs-dental-implants` | dentures-vs-implants |
| 56, 57 (years after extraction / bone loss, partial) | `all-on-4-dental-implants-after-years-of-missing-teeth` | candidacy-recovery |
| 69 (single vs full arch) | `full-arch-vs-individual-dental-implants` | all-on-4 |
| — (why All-on-4) | `why-people-are-choosing-all-on-4` | all-on-4 |

Link new posts to these. Expand an existing URL only when the new query is the same intent.

### Defer

- **99** Environmental impact of implants vs dentures. No patient demand and no path to a consultation.
- Pure price-list posts (**16, 21, 22**) until they are reframed with no dollar figures.
- Generic single-tooth procedural posts that never mention a full arch, until the All-on-4 and coverage clusters are deeper.

## Wave 1 — draft these first

Ten posts, aligned with Phase 4.5 in [the SEO blog plan](../plans/2026-09-29-seo-blog-lead-quiz-plan.md). Each needs a clinical review before `reviewedBy` / `lastReviewed` are set. Suggested order is two per week.

| Order | Working title | Cluster | Primary query | Gemini # | Internal links |
|---|---|---|---|---|---|
| 6 | Does the Canadian Dental Care Plan Cover Dental Implants? | cost-coverage | does cdcp cover dental implants | 17 | `/pricing`, dentures vs implants |
| 7 | Can You Get Dental Implants If You Have Bone Loss? | candidacy-recovery | dental implants with bone loss | 50, 57 | All-on-4 after missing teeth, `/services/all-on-4-dental-implants` |
| 8 | Snap-On Dentures vs All-on-4: Which Stays Fixed? | dentures-vs-implants | snap-on dentures vs all-on-4 | 63 | dentures vs implants, `/services/snap-on-dentures` |
| 9 | All-on-4 Recovery: What the First Weeks Feel Like | candidacy-recovery | all-on-4 recovery timeline | 2, 8, 10 | same-day implants, `/what-to-expect` |
| 10 | How Long Do All-on-4 Dental Implants Last? | all-on-4 | how long do all-on-4 implants last | 78 | why choose All-on-4 |
| 11 | Sedation for Dental Implant Surgery: What Are the Options? | anxiety-sedation | sedation for dental implant surgery | 3, 5, 11 | `/services/sedation-dentistry`, `/dental-anxiety` |
| 12 | Can You Get Dental Implants If You Have Diabetes or Smoke? | candidacy-recovery | dental implants with diabetes or smoking | 47, 48 | quiz (do not retarget “am I a candidate”) |
| 13 | Denturist vs Dentist: Who Makes Your Implant Teeth? | all-on-4 | denturist vs dentist for dental implants | 95, 98 | `/meet-your-dentist`, `/for-dentists` |
| 14 | What Is Included in an All-Inclusive Implant Quote? | cost-coverage | what is included in dental implant cost | 18, 20 | `/pricing`, CDCP post |
| 15 | Dental Implant Not Feeling Right: What to Do Next | candidacy-recovery | signs of dental implant failure | 81, 83, 84 | `/contact-us` |

`order` continues from the five published posts (1–5).

## Pillars

Service pages are the hubs. Blog posts are the spokes. Dedicated `/guides/` URLs are not required yet.

| Pillar | Hub already on the site | Spoke cluster |
|---|---|---|
| Full-arch and All-on-4 | `/services/all-on-4-dental-implants`, `/services/full-arch-dental-implants`, `/services/same-day-dental-implants` | `all-on-4` |
| Dentures and snap-on teeth | dentures vs implants post, snap-on service | `dentures-vs-implants` |
| Cost and CDCP | `/pricing` | `cost-coverage` |
| Candidacy, healing, aftercare | `/what-to-expect`, quiz | `candidacy-recovery` |
| Anxiety and sedation | `/dental-anxiety`, sedation service | `anxiety-sedation` |

Every new post: one `primaryQuery`, one cluster, answer in the first paragraph, one `<ExtractionTable>`, `<BlogCta />`, question H2s, sourced `<KeyStat>` figures, a short Why Renew section, `## Sources`, at least three FAQs, and two or three internal links in the same cluster first.

## 90-day shape (adapted)

The Gemini calendar’s three “anchor guides” map onto pages that already exist or onto Wave 1 posts. Do not publish a second cost guide that lists prices.

| Month | Ship | Objective |
|---|---|---|
| Month 1 | CDCP post, bone-loss post, sedation post, plus the existing cost page as the cost hub | Coverage honesty, eligibility, anxiety |
| Month 2 | Snap-on vs All-on-4, how long All-on-4 lasts, diabetes/smoking | Comparisons and longevity for the money query |
| Month 3 | Recovery timeline, what’s in a quote, implant not feeling right, denturist vs dentist | Expectations, quote transparency, repair intent |

## Full backlog (105)

Status: **published** (covered), **wave-1**, **backlog**, **rewrite** (topic is valid only after the constraint in Review), **defer**.

Cluster is the `cluster` frontmatter value to use when the post is drafted.

### 1. Pain, anxiety, and recovery → `anxiety-sedation` unless noted

| # | Title | Cluster | Status |
|---|---|---|---|
| 1 | Do Dental Implants Hurt? The Honest Truth About Surgery Pain | anxiety-sedation | backlog |
| 2 | Dental Implant Recovery: Day-by-Day Pain Management Guide | candidacy-recovery | wave-1 (fold into All-on-4 recovery) |
| 3 | Sleep Dentistry for Implants: IV Sedation vs. Oral Sedation | anxiety-sedation | wave-1 |
| 4 | I'm Terrified of the Dentist: How We Handle Dental Implant Anxiety | anxiety-sedation | backlog — link `/dental-anxiety` |
| 5 | Local Anesthesia for Dental Implants: What Will You Actually Feel? | anxiety-sedation | backlog |
| 6 | Does Bone Grafting Hurt More Than the Implant Surgery? | anxiety-sedation | backlog |
| 7 | Throbbing Pain After Dental Implant: What’s Normal and What’s Not? | candidacy-recovery | backlog |
| 8 | Returning to Work After Implant Surgery: How Much Time Do I Need? | candidacy-recovery | wave-1 (section inside recovery post) |
| 9 | Is Dental Implant Surgery Worse Than Getting a Tooth Pulled? | anxiety-sedation | backlog |
| 10 | The First 48 Hours: Managing Swelling and Discomfort After Implants | candidacy-recovery | wave-1 (section inside recovery post) |
| 11 | Needle Phobia and Dental Implants: Sedation Options Explained | anxiety-sedation | wave-1 (section inside sedation post) |
| 12 | Does Removing a Failing Implant Hurt? | anxiety-sedation | backlog |
| 13 | Over-the-Counter vs. Prescription Painkillers for Implant Recovery | candidacy-recovery | backlog — no dosing advice; defer to the surgeon |
| 14 | What to Expect During the Healing Abutment Placement | candidacy-recovery | backlog |
| 15 | Mental Preparation: 5 Ways to Calm Your Nerves Before Implant Surgery | anxiety-sedation | backlog |

### 2. Price, cost, and financing → `cost-coverage`

No post in this section may contain a dollar amount.

| # | Title | Status |
|---|---|---|
| 16 | How Much Do Dental Implants Really Cost in Ottawa? | rewrite — “what changes an Ottawa full-arch quote,” no figures |
| 17 | Are Dental Implants Covered by the Canadian Dental Care Plan (CDCP)? | wave-1 — dentures and overdentures with preauthorization; most implants are not |
| 18 | Hidden Costs of Dental Implants: CT Scans, Extractions, and Bone Grafts | wave-1 — retitle to “What Is Included in an All-Inclusive Implant Quote?” |
| 19 | Dental Implant Financing: Payment Plans and Third-Party Options | backlog — name that plans exist; do not quote rates |
| 20 | Why Are Dental Implants So Expensive? (And Why They Are Worth It) | backlog — no prices; longevity and bone, link the ROI comparison carefully |
| 21 | All-on-4 vs. Traditional Implants: A Complete Cost Breakdown | rewrite — comparison of what differs, not a price table |
| 22 | Single Tooth Implant Cost: A Step-by-Step Price Guide | defer — off the full-arch focus, and it requires prices |
| 23 | Does Health Insurance or HSA/FSA Cover Dental Implants? | backlog — Canada: private plans and health spending accounts; verify against CRA/insurer sources |
| 24 | Cheap Dental Implants: The Dangers of Discount Dental Tourism | backlog — outcomes and follow-up, no price claims |
| 25 | Tax Deductions for Medical Expenses: Dental Implants in Canada | backlog — cite CRA only |
| 26 | Should I Get a Bridge to Save Money Instead of an Implant? | backlog |
| 27 | Dental Implant Warranty: What Happens If My Implant Fails? | rewrite — no “guarantee”; describe how the clinic handles a problem |
| 28 | How to Budget for Full-Mouth Dental Implants | rewrite — financing paths, no sample budgets with numbers |
| 29 | Provincial Health Coverage and Dental Implants: Fact vs. Fiction | backlog — Ontario |
| 30 | The Long-Term ROI of Dental Implants vs. Replacing Dentures | rewrite — no dollar ROI; compare replacement cycle and daily wear |

### 3. Procedure and timelines → `candidacy-recovery` unless noted

| # | Title | Cluster | Status |
|---|---|---|---|
| 31 | The Dental Implant Procedure Step-by-Step: From Scan to Crown | candidacy-recovery | backlog — All-on-4 / full-arch version; `/what-to-expect` is the hub |
| 32 | How Long Does It Take to Get a Dental Implant? (Full Timeline) | candidacy-recovery | backlog |
| 33 | Teeth in a Day: How Same-Day Dental Implants Actually Work | candidacy-recovery | published |
| 34 | What Happens During a Dental Implant Consultation? | candidacy-recovery | backlog |
| 35 | The Osseointegration Process: Why Waiting is Crucial for Success | candidacy-recovery | backlog |
| 36 | Healing Abutments Explained: The Second Stage of Implant Surgery | candidacy-recovery | backlog |
| 37 | Immediate vs. Delayed Implant Placement: Which is Better? | candidacy-recovery | published overlap with same-day post — add only if a distinct query remains |
| 38 | What is a Surgical Guide for Dental Implants? | all-on-4 | backlog |
| 39 | 3D CBCT Scans for Implants: Why We Don't Just Use Standard X-Rays | candidacy-recovery | backlog |
| 40 | Placing the Final Crown: The Last Step of Your Implant Journey | candidacy-recovery | backlog — full-arch prosthesis, not only a single crown |
| 41 | Can You Get a Tooth Pulled and an Implant on the Same Day? | candidacy-recovery | backlog |
| 42 | How Long Does the Actual Implant Surgery Take? | candidacy-recovery | backlog |
| 43 | Temporary Teeth During Implant Healing: Will I Leave Without a Tooth? | all-on-4 | backlog — same-day temporary teeth |
| 44 | The Role of the Dental Lab in Creating Your Custom Implant Teeth | all-on-4 | backlog — on-site lab |
| 45 | Why Your Dentist Wants You to Wait 3–6 Months for the Final Teeth | candidacy-recovery | backlog — confirm the clinic’s real staging before stating a range |

### 4. Eligibility and health factors → `candidacy-recovery`

| # | Title | Status |
|---|---|---|
| 46 | Am I Too Old for Dental Implants? (Age Limits Explained) | backlog — do not steal the quiz’s “am I a candidate” query; target age specifically |
| 47 | Can Diabetics Get Dental Implants? Risks and Requirements | wave-1 (combined with smoking) |
| 48 | Smoking and Dental Implants: Will My Implants Fail? | wave-1 — “will they fail?” must say outcomes vary |
| 49 | Osteoporosis and Dental Implants: Can You Still Get Them? | backlog |
| 50 | What is Bone Grafting and Why Do 50% of Implant Patients Need It? | wave-1 — drop the 50% until a primary source exists; retitle around bone loss |
| 51 | Sinus Lifts for Upper Dental Implants | backlog — link `/services/upper-jaw-implants` |
| 52 | Can I Get Dental Implants if I Have Gum Disease? | backlog |
| 53 | Autoimmune Diseases and Dental Implant Success Rates | backlog — only with a cited rate |
| 54 | Bruxism (Teeth Grinding): Will It Damage My Dental Implants? | backlog |
| 55 | Pregnancy and Dental Implants: Should You Wait? | backlog |
| 56 | Can I Get an Implant Years After a Tooth Was Extracted? | published |
| 57 | What Causes Jaw Bone Loss and How Implants Stop It | wave-1 overlap with bone-loss post and the missing-teeth post |
| 58 | Medications That Interfere With Dental Implant Healing | backlog — name classes only with a primary source; no personal medical advice |
| 59 | Vaping and Dental Implants: Is It Safer Than Cigarettes? | backlog |
| 60 | How to Prepare Your Body for a Successful Implant Surgery | backlog |

### 5. Comparisons and alternatives

| # | Title | Cluster | Status |
|---|---|---|---|
| 61 | Dental Implants vs. Dentures: The Ultimate Comparison | dentures-vs-implants | published |
| 62 | Dental Implants vs. Dental Bridges | dentures-vs-implants | backlog |
| 63 | Snap-On Dentures vs. All-on-4 Permanent Implants | dentures-vs-implants | wave-1 |
| 64 | Mini Dental Implants vs. Traditional Implants | dentures-vs-implants | backlog |
| 65 | Zirconia vs. Titanium Dental Implants | all-on-4 | backlog |
| 66 | Root Canal vs. Tooth Extraction and Implant | dentures-vs-implants | defer — single-tooth |
| 67 | Flippers vs. Dental Implants for a Missing Front Tooth | dentures-vs-implants | defer — single-tooth |
| 68 | Implant-Supported Dentures vs. Traditional Dentures | dentures-vs-implants | published overlap — new URL only for snap-on vs All-on-4 |
| 69 | Single Implant vs. Multiple Implants for Three Missing Teeth | all-on-4 | published as full arch vs individual |
| 70 | Clear Aligners Before Dental Implants: Is It Necessary? | candidacy-recovery | defer |
| 71 | Denture Adhesives vs. Implant Stability | dentures-vs-implants | backlog |
| 72 | Porcelain vs. Zirconia Crowns for Your Dental Implant | all-on-4 | backlog — prosthesis materials for a full arch |
| 73 | Why Dentures Change Your Face Shape (And Implants Don’t) | dentures-vs-implants | backlog — or a section in the existing dentures post if the query is the same |
| 74 | All-on-4 vs. All-on-6 Dental Implants | all-on-4 | backlog |
| 75 | Alternatives to Dental Implants if You Lack Bone Density | candidacy-recovery | backlog — pair with the bone-loss post |

### 6. Aftercare, maintenance, and longevity → `candidacy-recovery` unless noted

| # | Title | Cluster | Status |
|---|---|---|---|
| 76 | How to Clean and Floss Your Dental Implants Properly | candidacy-recovery | backlog — full-arch hygiene |
| 77 | The Best Toothpaste and Mouthwash for Dental Implants | candidacy-recovery | backlog |
| 78 | How Long Do Dental Implants Actually Last? | all-on-4 | wave-1 — All-on-4 longevity, not a generic single implant |
| 79 | Can Dental Implants Get Cavities? | candidacy-recovery | backlog |
| 80 | Peri-Implantitis: The Number One Threat to Your Dental Implant | candidacy-recovery | backlog |
| 81 | Early Signs of Dental Implant Failure You Shouldn't Ignore | candidacy-recovery | wave-1 |
| 82 | What to Eat After Dental Implant Surgery: A 2-Week Meal Plan | candidacy-recovery | backlog |
| 83 | Can a Dental Implant Fall Out? Causes and Solutions | candidacy-recovery | wave-1 (section) |
| 84 | Why Does My Dental Implant Feel Loose? | candidacy-recovery | wave-1 (section) |
| 85 | Waterpiks and Dental Implants: Are They Safe to Use? | candidacy-recovery | backlog |
| 86 | Do Dental Implants Stain Like Natural Teeth? | candidacy-recovery | backlog |
| 87 | Can You Whiten a Dental Implant Crown? | candidacy-recovery | backlog |
| 88 | Professional Implant Cleanings: What Your Hygienist Does Differently | candidacy-recovery | backlog |
| 89 | How to Protect Your Dental Implants While Playing Sports | candidacy-recovery | defer |
| 90 | Traveling After Dental Implant Surgery: Flying and Vacation Tips | candidacy-recovery | backlog |

### 7. Materials, technology, and clinic trust

| # | Title | Cluster | Status |
|---|---|---|---|
| 91 | What Are Dental Implants Made Of? | all-on-4 | backlog |
| 92 | Why the Brand of Your Dental Implant Actually Matters | all-on-4 | backlog — name the systems the clinic actually uses |
| 93 | How 3D Printing is Changing Dental Implant Surgery | all-on-4 | backlog — only if the clinic uses it |
| 94 | The Importance of a Board-Certified Specialist for Implant Surgery | all-on-4 | rewrite — describe the surgeon on the team; do not invent board certification |
| 95 | Oral Surgeon vs. General Dentist for Dental Implants | all-on-4 | wave-1 — retitle to denturist, surgeon, and lab |
| 96 | Red Flags to Watch Out For When Choosing an Implant Dentist | all-on-4 | backlog — Ottawa |
| 97 | How We Use Digital Impression Scanners | all-on-4 | backlog — only the scanners the clinic uses |
| 98 | What is a Prosthodontist and Why Do You Need One for Implants? | all-on-4 | wave-1 overlap — Renew’s tooth-maker is the denturist |
| 99 | The Environmental Impact of Dental Implants vs. Disposable Dentures | — | defer |
| 100 | Dental Implant Success Rates: What the Clinical Data Says | all-on-4 | backlog — cite the study; no unsourced percentages |
| 101 | Behind the Scenes: How We Sterilize Our Implant Surgical Suites | anxiety-sedation | backlog |
| 102 | What Happens if You Are Allergic to Metal Implants? | candidacy-recovery | backlog |
| 103 | Navigated Implant Surgery: The Future of Precision Dentistry | all-on-4 | backlog — only if offered |
| 104 | Why We Take Photos During Your Dental Implant Journey | all-on-4 | backlog — `/before-after` has described cases, not a photo gallery |
| 105 | Patient Stories: Real Life-Changing Dental Implant Transformations | all-on-4 | backlog — `/patient-stories` is the hub; use verified reviews only |

## Original Gemini framework (archived)

Kept so the backlog above can be traced. Draft from the adapted tables, not from this archive.

### Core framework

Hub and spoke. Guides are mid- and bottom-funnel hubs. Blog posts are top-of-funnel spokes.

Gemini’s three hubs:

1. The Complete Guide to Dental Implant Costs & Financing
2. The Dental Implant Patient Journey: Step-by-Step
3. Dental Implants vs. Dentures vs. Bridges

On this site those intents already have homes: `/pricing`, `/what-to-expect`, and `dentures-vs-dental-implants`. Extend those URLs instead of launching parallel guides.

### Omnichannel notes that still apply

- **SEO:** Ottawa and Orléans in titles and metadata where the query is local. Internal links to the quiz, the matching service page, and one sibling post.
- **AEO:** Question title, direct answer in the first 50–80 words, then the article.
- **GEO:** Primary-source citations, MedicalWebPage + BlogPosting + FAQPage (already emitted), and first-hand clinic facts. `reviewedBy` only after a real clinical review.

### Conversion

Gemini asked for a low-friction CTA. Renew’s version is the two-minute, nine-question implant candidate quiz, plus the phone number.

## Social posts and paid ads

Two later Gemini shares cover Instagram, Facebook, and Meta video ads. They are adapted in `docs/content/social/`:

| File | Role |
|---|---|
| [design-system.json](social/design-system.json) | The only colors, type, wordmark, and end card. Tokens must match `:root` in `src/app/globals.css`. |
| [pipeline.json](social/pipeline.json) | Stages from pick to ship. Paid is 14 video, 14 static, and 13 carousel. The feed is 10 of each. |
| [ads.json](social/ads.json) | 40 paid angles from [the ads share](https://share.gemini.google/AN9qX8ucJp3B), rewritten without prices, fake patients, or same-day-permanent claims, plus the denture-slip film. Each angle is video, static, or carousel. |
| [organic-calendar.json](social/organic-calendar.json) | 10 weeks of Tuesday / Thursday / Friday posts from [the strategy share](https://share.gemini.google/tIrA2VZtpAh2), at the 30/30/20/20 pillar mix, split evenly across video, static, and carousel. |
| [distribution.json](social/distribution.json) | Blogs stay on this domain. A third clinic is not invented. |

Video ends on the `video-end-card` layout. Static is one 4:5 frame plus a square. Carousels close on `cta-still`. All three use DM Serif Display, Plus Jakarta Sans, the typed `renew implants` wordmark, a lime pill, and the aqua arch. Generated frames use `buildPromptPrefix()` in `src/lib/social-pipeline.ts`. Quote cards may only repeat a review in `src/content/testimonials.ts`. Run `npx vitest run src/lib/social-pipeline.test.ts` before adding a unit.
