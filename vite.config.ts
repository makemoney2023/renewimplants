import { execFileSync } from "node:child_process";
import { cloudflare } from "@cloudflare/vite-plugin";
import { staticAssetsAdapter } from "@vinext/cloudflare/cache/static-assets-adapter";
import vinext from "vinext";
import { defineConfig, type Plugin } from "vite";

// vinext-cloudflare deploy calls Vite itself, so npm's prebuild script does not
// run. public/media is gitignored. If it is missing when Vite copies public/,
// those URLs miss the asset bundle and the Worker renders the app 404 page.
function preparePublicFiles(): Plugin {
  return {
    name: "renew-prepare-public-files",
    apply: "build",
    config() {
      execFileSync(process.execPath, ["--experimental-strip-types", "scripts/media-sync.mjs"], {
        stdio: "inherit",
      });
      execFileSync(process.execPath, ["scripts/embed-blog.mjs"], { stdio: "inherit" });
    },
  };
}

export default defineConfig({
  plugins: [
    preparePublicFiles(),
    vinext({
      // Prerendered HTML is served from Workers static assets. The quiz API
      // and the social preview (it reads search params) still run on the Worker.
      cache: { cdn: staticAssetsAdapter() },
      prerender: { routes: "*" },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
