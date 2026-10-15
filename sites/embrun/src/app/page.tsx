import { HomePage } from "@shell/components/home-page";
import { JsonLd } from "@shell/components/json-ld";
import { pageMetadata } from "@shell/lib/page-meta";
import { buildPageGraph } from "@shell/lib/schema";
import { catalog, site } from "@/content/load";

const page = catalog.getPage("/");

export const metadata = page ? pageMetadata(page) : {};

export default function Home() {
  if (!page) return null;
  return (
    <>
      <HomePage page={page} />
      <JsonLd data={buildPageGraph(site, catalog, page)} />
    </>
  );
}
