import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/api/v1/media*',
      },
      {
        protocol: 'https',
        hostname: 'api.thearena.lk',
        pathname: '/api/v1/media*',
      },
    ],
  },
};

export default nextConfig;