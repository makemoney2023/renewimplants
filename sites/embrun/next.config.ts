import type { NextConfig } from "next";
import { getRedirects } from "./src/profile/redirects";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-5816dac948084d6bbbebbfef2581cc24.r2.dev",
      },
    ],
  },
  async redirects() {
    return getRedirects().map((item) => ({
      source: item.source,
      destination: item.destination,
      statusCode: item.statusCode,
    }));
  },
};

export default nextConfig;
