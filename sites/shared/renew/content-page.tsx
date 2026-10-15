import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocumentPage } from "@/components/document-page";
import { JsonLd } from "@/components/json-ld";
import { getRouteContent, getRouteSlugs, type RouteContent } from "@/content/routes";
import { formsBySlug, leadSite, site } from "@/content/site";
import { buildRouteGraph } from "@/lib/site-schema";
import { LeadForm } from "@shell/components/lead-form";
import { findForm } from "@shell/lib/leads";

type PageProps = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return getRouteSlugs().map((slug) => ({ slug: slug.split("/") }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = getRouteContent((await params).slug.join("/")) as RouteContent | undefined;
  if (!page) return {};

  return {
    title: `${page.title} | ${site.name}`,
    description: page.intro,
    alternates: { canonical: `/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.intro,
      url: `/${page.slug}`,
      images: [{ url: page.image }],
    },
  };
}

export default async function ContentPage({ params }: PageProps) {
  const page = getRouteContent((await params).slug.join("/")) as RouteContent | undefined;
  if (!page) notFound();

  const form = findForm(leadSite, formsBySlug[page.slug] ?? "");

  return (
    <>
      <DocumentPage page={page}>{form ? <LeadForm form={form} pagePath={`/${page.slug}`} /> : null}</DocumentPage>
      <JsonLd data={buildRouteGraph(page)} />
    </>
  );
}
