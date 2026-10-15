import fs from "node:fs";
import path from "node:path";
import { cloudflare } from "@cloudflare/vite-plugin";
import { staticAssetsAdapter } from "@vinext/cloudflare/cache/static-assets-adapter";
import vinext from "vinext";
import { defineConfig, type Plugin } from "vite";
import { clinicAliases } from "../shared/vite-alias";

// vinext emits the cacheability manifest at dist/server/, while the worker
// chunk imports it from dist/server/_next/static/. Copy it before prerender.
function placeCacheabilityManifest(): Plugin {
  return {
    name: "clinic-cacheability-manifest",
    apply: "build",
    enforce: "post",
    closeBundle() {
      const serverDir = path.resolve(import.meta.dirname, "dist/server");
      const targetDir = path.join(serverDir, "_next/static");
      if (!fs.existsSync(targetDir)) return;
      for (const file of fs.readdirSync(targetDir)) {
        if (!file.startsWith("worker-entry") || !file.endsWith(".js")) continue;
        const text = fs.readFileSync(path.join(targetDir, file), "utf8");
        for (const match of text.matchAll(/(?:from|import)"\.\/([^"]+\.js)"/g)) {
          const name = match[1];
          const target = path.join(targetDir, name);
          const source = path.join(serverDir, name);
          if (!fs.existsSync(target) && fs.existsSync(source)) fs.copyFileSync(source, target);
        }
      }
    },
  };
}

export default defineConfig({
  resolve: {
    alias: clinicAliases(import.meta.dirname),
    tsconfigPaths: false,
  },
  server: {
    fs: {
      allow: [path.resolve(import.meta.dirname, "../..")],
    },
  },
  plugins: [
    vinext({
      cache: { cdn: staticAssetsAdapter() },
      prerender: { routes: "*" },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
    placeCacheabilityManifest(),
  ],
});
