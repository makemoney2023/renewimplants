declare module "cloudflare:workers" {
  export const env: {
    DB: {
      prepare(query: string): {
        bind(...values: Array<string | number | null>): {
          run(): Promise<unknown>;
        };
      };
    };
    NEXT_PUBLIC_SITE_URL?: string;
    MEDIA_BASE_URL?: string;
  };
}
