import type { ClinicPage, ClinicSite } from "../types";

export function buildLlmsTxt(site: ClinicSite, pages: ClinicPage[]) {
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.address.label}. ${site.phone.label}. ${site.email}.`,
    "",
    "## Pages",
    "",
  ];

  for (const page of pages) {
    const description = page.description ? `: ${page.description.replace(/\s+/g, " ").trim()}` : "";
    lines.push(`- [${page.title}](${site.url}${page.path})${description}`);
  }

  lines.push(
    `- [Implant candidate quiz](${site.url}/implant-candidate-quiz/): Nine questions about implant options. The thank-you page is not listed because it is a private result URL.`,
  );

  lines.push("");
  return lines.join("\n");
}
