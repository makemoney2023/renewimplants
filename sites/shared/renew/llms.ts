import { getRouteContent, getRouteSlugs } from "@/content/routes";
import { blogIntro, site } from "@/content/site";
import { siteOrigin } from "@/lib/site-origin";
import { posts } from "@clinic/profile/blog";

export function GET() {
  const origin = siteOrigin();
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.address}. ${site.phone.label}. ${site.email}.`,
    "",
    "## Pages",
    "",
    `- [Home](${origin}/): ${site.description}`,
    `- [Blog](${origin}/blog): ${blogIntro}`,
  ];

  for (const slug of getRouteSlugs()) {
    const page = getRouteContent(slug);
    if (!page || slug === "sitemap") continue;
    lines.push(`- [${page.title}](${origin}/${slug}): ${page.intro}`);
  }

  for (const post of posts) {
    lines.push(`- [${post.title}](${origin}/blog/${post.slug}): ${post.description}`);
  }

  lines.push(
    `- [Implant candidate quiz](${origin}/implant-candidate-quiz): Nine questions about implant options. The thank-you page is not listed because it is a private result URL.`,
    "",
  );

  return new Response(lines.join("\n"), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
