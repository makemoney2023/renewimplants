import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Canonical URLs keep the WordPress trailing slash.
  trailingSlash: true,
};

export default nextConfig;
