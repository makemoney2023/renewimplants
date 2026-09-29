import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Component specs opt into jsdom with a `@vitest-environment jsdom` docblock.
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
