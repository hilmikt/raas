/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  transpilePackages: ["wagmi", "viem"],
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
