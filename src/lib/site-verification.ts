import type { Metadata } from "next";

type VerificationEnv = Record<string, string | undefined>;

export function getSiteVerification(env: VerificationEnv): Metadata["verification"] {
  const google = env.GOOGLE_SITE_VERIFICATION?.trim();
  const bing = env.BING_SITE_VERIFICATION?.trim();
  if (!google && !bing) return undefined;

  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
  };
}
