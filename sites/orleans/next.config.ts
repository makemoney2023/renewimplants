import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Canonical URLs keep the WordPress trailing slash. Next redirects the
  // slashless duplicates, including Orleans /contact -> /contact/.
  trailingSlash: true,
};

export default nextConfig;
