# Cloudflare migration

The site moves from the Vercel project behind https://renewimplants.vercel.app to a
Cloudflare Worker. DNS is unchanged in this change. `npm run dev` and `npm run build`
still run Next.js, so the existing Vercel project can keep deploying until the
Worker is serving traffic and the domain is pointed at it.

There was no `vercel.json`, no Vercel Cron, and no Vercel storage SDK. The only
Vercel-specific surface was the Next.js hosting itself (including `next/image`
and `next/og`).

## Architecture

| Current (Vercel) | Cloudflare | Why |
|---|---|---|
| Next.js 16 App Router on Vercel | [vinext](https://github.com/cloudflare/vinext) on a Worker, with static assets | Cloudflare's current Next.js path. Pages is for static exports; this app has a route handler and one dynamic page. |
| Prerendered pages and `public/` | Workers static assets (`dist/client`) | Marketing pages, media, sitemap, and RSS are build output. Shipped media files are under the 25 MiB per-file asset limit, so R2 is not required. |
| `POST /api/quiz-leads` | Same route on the Worker | One small JSON write. It stays a Worker route handler. |
| Supabase (`quiz_leads`, never provisioned) | D1 binding `DB`, database `renewimplants-leads` | The Supabase org was at its free-project limit and the SQL was never applied, so there is no data to move. D1 is the binding the Worker already runs next to. |
| `next/image` optimizer | Original files, unless Cloudflare Images is turned on later | Avoids a second product. Images still render; they are not resized at the edge. |
| `next/font/google` | Self-hosted by vinext when the font options are static | The root layout's two families are static, so the build can host them. |
| `next/og` blog images | Prerendered during `build:vinext` | Generated at build time with the rest of the blog. |
| Env vars on Vercel | Build-time shell env, plus `vars` in `wrangler.jsonc` | See below. D1 does not need a secret. |
| No cron | No Cron Trigger | Nothing in the repo was scheduled. IndexNow stays a manual script. |
| `scrape.py` | Stays a local script | Not a request handler. See Python below. |

vinext is in beta. `npx vinext check` scored this app 92%. The only app-level
partial is App Router `reactStrictMode` (vinext does not wrap the App Router
root in `StrictMode` yet). The `__dirname` hits were under `skills/`, which is
not part of the site bundle.

## What did not move, and why

**Python.** `scrape.py` is the one-off salvage scraper. It shells out to `curl`
and writes HTML and assets onto a local disk. Python Workers do not provide a
project filesystem or subprocesses, and the script is not on the request path.
Run it locally if the salvage pack needs to be regenerated. Do not deploy it.

**Supabase file.** `supabase/migrations/20260929150000_quiz_leads.sql` is the
unused Postgres design. The Worker reads `d1/migrations/0001_quiz_leads.sql`.
D1 has no row-level security. The equivalent control is that only this Worker
holds the binding, and there is no public read route. Dashboard SQL access is
an operator path: limit who can open the database. D1 also has no Canada-only
region. If a future review requires the lead rows to stay in Canada, put them
in a Canadian Postgres and connect with Hyperdrive instead of D1. There is
nothing to export today.

**KV and R2.** The app does not use `"use cache"` or ISR, so a KV data cache
would be an empty namespace. Media is copied into `public/media` at build time
and uploaded as static assets.

**Social catalog host.** Quiz clicks use `SOCIAL_QUIZ_HOST` in
`src/lib/social-pipeline.ts`. It is the Cloudflare Workers deployment until the
clinic domain serves the quiz. Cut over to `https://www.renewimplants.ca` by
changing that constant. Unit `ctaHref` values stay relative and keep their UTM
parameters.

**Vercel project.** Leave it deployed until the Worker is checked on its
`workers.dev` hostname. No `vercel.json` was added. Removing the Vercel project
is a manual step after DNS cutover.

## Environment variables and secrets

| Name | Where | Secret? |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `wrangler.jsonc` `vars`, and `.env.local` for IndexNow | No. Already `https://www.renewimplants.ca`. |
| `NEXT_PUBLIC_GA_ID` | Shell env when running `build:vinext` | No. Omitted means no GA tag. The live site used `G-YZG16B3H0V`. |
| `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` | Shell env when running `build:vinext` | No. Meta-tag values. Omitted means those tags are absent. |
| `INDEXNOW_KEY` | Shell env for `npm run indexnow` only | Treat it as a secret in CI. The same value is public at `/<key>.txt`, and the Worker does not read it. |
| D1 binding `DB` | `wrangler.jsonc` | No API key. Access is the binding. |

Do not put tokens in `wrangler.jsonc`. Prerendered HTML picks up GA and
verification from the environment of the build, because the root layout reads
`process.env` while the pages are rendered. A later `wrangler secret put` does
not rewrite pages that were already prerendered.

Local quiz storage uses the built Worker's D1 file under
`dist/server/.wrangler`. A vinext rebuild replaces `dist/`, so apply the
migration after `build:vinext`, then start the server:

```bash
npm run build:vinext
npm run d1:migrate:local
npm run start:vinext
```

## Deploy

Do this from a Cloudflare account you control. This repository change does not
deploy and does not edit DNS.

1. `npx wrangler login` (or set `CLOUDFLARE_API_TOKEN` with Workers and D1 edit).
2. The D1 database `renewimplants-leads` already exists. Its id is
   `9a27ec79-78cd-4dc1-af24-2eea59d72701` in `wrangler.jsonc`, and
   `0001_quiz_leads.sql` has been applied. Do not create a second database.
   A later schema change is `npx wrangler d1 migrations apply DB --remote`.

3. Build with any public env you want baked into HTML, then deploy:

   ```bash
   NEXT_PUBLIC_GA_ID=G-... \
   GOOGLE_SITE_VERIFICATION=... \
   BING_SITE_VERIFICATION=... \
   npm run build:vinext
   npm run deploy:vinext
   ```

   `deploy:vinext` runs `vinext-cloudflare deploy`, which builds with Vite
   directly. That build copies `public/media` into the asset bundle. The Vite
   config runs `media:sync` first, because this command does not run npm's
   `prebuild:vinext` hook and `public/media` is gitignored. Without those
   files, a request such as `/media/heroes/renew-hero.jpg` misses static
   assets. `not_found_handling` is `none`, so the Worker renders the app 404
   page: the root layout title, and the body "404: This page could not be
   found." Check `/`, a service page, `/media/heroes/renew-hero.jpg`, the
   quiz, a blog post, and `/blog/<slug>/opengraph-image` on the `workers.dev`
   URL before any DNS change. `/quiz` is not a route here or on the Vercel
   deploy; the quiz is `/implant-candidate-quiz`.

4. When that URL is good, attach the hostname in the Workers dashboard or with
   a route (not added here, so a deploy cannot take the domain):

   ```jsonc
   "routes": [{ "pattern": "www.renewimplants.ca", "custom_domain": true }]
   ```

   Point DNS at Cloudflare only after that route exists and the Worker responds
   on the hostname. Apex and `www` both need a decision; the canonical host in
   `src/content/site.ts` is `https://www.renewimplants.ca`.

5. After the canonical host serves the new sitemap, run `npm run indexnow`.

Day-to-day development is `npm run dev:vinext` (port 3001, media sync included).
It uses the same local D1 file once `dist/server/wrangler.json` exists.
`npm run cf:types` writes `worker-configuration.d.ts` from `wrangler.jsonc`.
That file is gitignored and is not part of `npm run typecheck`: the Workers
runtime types replace the DOM `Response` type the Next.js app typechecks against.
`src/types/cloudflare-workers.d.ts` declares the `DB` binding the route uses.

## Known gaps

- **Image resizing.** `next/image` is unoptimized on the Worker. To turn on
  Cloudflare Images later: `npx vinext init --platform=cloudflare --legacy-wrangler-cloudflare-init --image-optimization=cloudflare-images`
  and enable the Images product on the account.
- **Source filesystem.** Sitemap, RSS, and blog OG images call `getAllPosts()`
  on the Worker. `content/blog/*.mdx` is copied to `src/lib/blog-sources.json`
  by `npm run blog:embed` (it runs before `dev`, `build`, and the vinext
  equivalents). The Worker uses that copy when `node:fs` cannot see the repo.
  Social preview JSON is imported directly for the same reason.
- **App Router strict mode** is not wrapped by vinext yet. The Next.js build
  still uses it.
- **D1 residency and access**, covered above.
- **Preview URLs** on `workers.dev` are public. Do not submit real patient
  details on a preview. The quiz stores name, email, phone, and health answers.
