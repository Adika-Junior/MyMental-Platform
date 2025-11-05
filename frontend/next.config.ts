import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90, 100],
    formats: ['image/avif', 'image/webp'],
  },
  reactCompiler: true,
};

export default nextConfig;
