// Imported by scripts/submit-indexnow.ts through Node's type stripping, so this
// module must stay free of path aliases and non-erasable TypeScript syntax.

export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export type IndexNowPayload = {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
};

export function isValidIndexNowKey(key: string) {
  return /^[a-f0-9]{8,128}$/i.test(key);
}

export function buildIndexNowPayload(args: {
  siteUrl: string;
  key: string;
  urls: string[];
}): IndexNowPayload {
  const origin = args.siteUrl.replace(/\/$/, "");
  return {
    host: new URL(origin).host,
    key: args.key,
    keyLocation: `${origin}/${args.key}.txt`,
    urlList: args.urls,
  };
}

export function extractSitemapUrls(xml: string) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}
