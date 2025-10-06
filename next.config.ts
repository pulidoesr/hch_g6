import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: { ignoreDuringBuilds: true }, // don’t fail CI on lint errors
};

export default nextConfig;

// next.config.js
module.exports = {
  async redirects() {
    return [{ source: '/Profiles', destination: '/profile', permanent: false }];
  },
};
