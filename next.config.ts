import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: { bodySizeLimit: "2mb" }
  },
  images: {
    remotePatterns: []
  }
};

export default nextConfig;
