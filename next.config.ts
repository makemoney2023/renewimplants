import type { NextConfig } from "next";
import { getRouteAliases } from "./src/content/nav";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return getRouteAliases().map((alias) => ({
      source: alias.source,
      destination: alias.destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
