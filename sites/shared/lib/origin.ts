import { site } from "@/content/load";

/** Canonical origin. Prerender bakes NEXT_PUBLIC_SITE_URL, same as Renew. */
export function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return site.url.replace(/\/$/, "");
  return configured.replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  const origin = siteOrigin();
  if (path === "/") return `${origin}/`;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}
