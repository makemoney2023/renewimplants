<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

- Open the dev server at `http://localhost:3000`. Next.js 16 blocks dev client resources when the site is opened as `127.0.0.1`, so client pages such as the implant quiz render but do not respond.
- Node 24 or newer is required. `npm run dev` and `npm run build` run `scripts/media-sync.mjs`, which imports TypeScript. The image default `node` cannot. The environment install puts Node 24.21.0 on `PATH` at `/usr/local/lib/nodejs/bin`.
- `.env.example` variables are optional for local development. Without `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, `POST /api/quiz-leads` returns 500 and the clinic phone number.
