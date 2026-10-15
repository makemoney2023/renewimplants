import type { Metadata } from "next";
import { site } from "@/content/load";
import type { ClinicPage } from "../types";
import { mediaUrl } from "./media";

export function pageMetadata(page: ClinicPage): Metadata {
  const title = page.documentTitle || `${page.title} | ${site.name}`;
  const description = page.description || site.description;
  const image = mediaUrl(page.hero || site.logo);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: page.path },
    openGraph: {
      title,
      description,
      url: page.path,
      siteName: site.name,
      locale: "en_CA",
      type: page.kind === "post" ? "article" : "website",
      images: [{ url: image }],
    },
    twitter: { card: "summary_large_image" },
  };
}
