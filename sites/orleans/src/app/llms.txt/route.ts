import { pages, site } from "@/content/load";
import { buildLlmsTxt } from "@shell/lib/llms";

export function GET() {
  return new Response(buildLlmsTxt(site, pages), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
