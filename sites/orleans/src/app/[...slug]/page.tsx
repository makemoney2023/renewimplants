import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@shell/components/json-ld";
import { PageView } from "@shell/components/page-view";
import { pageMetadata } from "@shell/lib/page-meta";
import { buildPageGraph } from "@shell/lib/schema";
import { catalog, site } from "@/content/load";

type Props = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  return catalog.pages
    .filter((page) => page.path !== "/")
    .map((page) => ({ slug: page.path.split("/").filter(Boolean) }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = catalog.getPage(`/${slug.join("/")}/`);
  if (!page) return {};
  return pageMetadata(page);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = catalog.getPage(`/${slug.join("/")}/`);
  if (!page) notFound();
  return (
    <>
      <PageView page={page} />
      <JsonLd data={buildPageGraph(site, catalog, page)} />
    </>
  );
}
