import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow any remote host so real CDN URLs from the API work once shipped.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
