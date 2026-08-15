import type { NextConfig } from "next";

const backendApi = (
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  "https://back.glaceelameer.com/api"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    // Allow any remote host so real CDN URLs from the API work once shipped.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backendApi}/:path*`,
      },
    ];
  },
};

export default nextConfig;
