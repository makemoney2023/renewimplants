import { defineConfig } from "vitest/config";
import { clinicAliases } from "../shared/vite-alias";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: clinicAliases(import.meta.dirname),
  },
});
