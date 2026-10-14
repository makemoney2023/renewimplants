import { site } from "@/content/site";

/**
 * Origin used for canonical, Open Graph, and Twitter URLs.
 *
 * Set `NEXT_PUBLIC_SITE_URL` before `npm run build:vinext` (prerender bakes it
 * into HTML) and as a Worker var (dynamic renders read it at request time).
 *
 * - Preview: `https://renewimplants.abracadabra-ai.workers.dev`
 * - Production: `https://www.renewimplants.ca`
 *
 * When the variable is unset, tags fall back to `site.url`.
 */
export function siteOrigin() {
  const configured =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SITE_URL?.trim() : undefined;
  if (!configured) return site.url;
  return configured.replace(/\/$/, "");
}
