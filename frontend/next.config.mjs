/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["wagmi", "viem"],
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
