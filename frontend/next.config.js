/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  transpilePackages: ["wagmi", "viem"],
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback ?? {}),
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    return config;
  },
};

module.exports = nextConfig;
