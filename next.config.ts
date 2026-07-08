import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "cdn.amoonbloom.com" },
      // Bunny CDN pull zones used by the production backend.
      { protocol: "https", hostname: "ammon-pull-zone.b-cdn.net" },
      { protocol: "https", hostname: "*.b-cdn.net" },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "clsx",
      "tailwind-merge",
      "motion",
      "@tanstack/react-query",
      "@reduxjs/toolkit",
    ],
  },
  async redirects() {
    return [
      { source: "/signup", destination: "/register", permanent: false },
    ];
  },
};

export default nextConfig;
