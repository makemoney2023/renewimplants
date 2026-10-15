import { site } from "@/content/load";

/** Swap the host later by setting MEDIA_BASE_URL at build time and on the Worker. */
export function mediaBase() {
  const configured =
    process.env.MEDIA_BASE_URL?.trim() || process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim();
  return (configured || site.mediaBaseDefault).replace(/\/$/, "");
}

export function mediaUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${mediaBase()}${path.startsWith("/") ? path : `/${path}`}`;
}
