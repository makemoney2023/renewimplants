import path from "node:path";
import type { Alias } from "vite";

/** Clinic apps render Renew's components. Content modules stay per clinic. */
export function clinicAliases(siteDir: string): Alias[] {
  const renewSrc = path.resolve(siteDir, "../../src");
  const shared = path.resolve(siteDir, "../shared");
  const localSrc = path.resolve(siteDir, "./src");
  return [
    { find: /^@shell\//, replacement: `${shared}/` },
    { find: /^@clinic\//, replacement: `${localSrc}/` },
    { find: /^@\/content\/site$/, replacement: path.join(localSrc, "profile/site.ts") },
    { find: /^@\/content\/nav$/, replacement: path.join(localSrc, "profile/nav.ts") },
    { find: /^@\/content\/routes$/, replacement: path.join(localSrc, "profile/routes.ts") },
    { find: /^@\/content\/testimonials$/, replacement: path.join(localSrc, "profile/testimonials.ts") },
    { find: /^@\//, replacement: `${renewSrc}/` },
  ];
}
