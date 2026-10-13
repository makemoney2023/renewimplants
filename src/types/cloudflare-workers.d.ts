// Named bindings match wrangler.jsonc. `npm run cf:types` writes the full
// Workers runtime to worker-configuration.d.ts, which is gitignored and kept
// out of this tsconfig: those runtime types replace DOM Response and break
// the Next.js app typecheck.
declare module "cloudflare:workers" {
  export const env: {
    DB: {
      prepare(query: string): {
        bind(...values: Array<string | number | null>): {
          run(): Promise<unknown>;
        };
      };
    };
    NEXT_PUBLIC_SITE_URL: string;
  };
}
