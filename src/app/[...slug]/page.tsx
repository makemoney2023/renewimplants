import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocumentPage } from "@/components/document-page";
import { ExperiencePage } from "@/components/experience-page";
import { JsonLd } from "@/components/json-ld";
import { getRouteContent, getRouteSlugs } from "@/content/routes";
import { site } from "@/content/site";
import { buildRouteGraph } from "@/lib/site-schema";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export function generateStaticParams() {
  return getRouteSlugs().map((slug) => ({ slug: slug.split("/") }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getRouteContent(slug.join("/"));
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
      type: page.slug.startsWith("blog/") ? "article" : "website",
    },
  };
}

export default async function ContentPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getRouteContent(slug.join("/"));
  if (!page) notFound();

  return (
    <>
      {page.grammar === "experience" ? (
        <ExperiencePage page={page} />
      ) : (
        <DocumentPage page={page} />
      )}
      <JsonLd data={buildRouteGraph(page)} />
    </>
  );
}
