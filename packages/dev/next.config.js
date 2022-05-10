/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false, // lets us bundle part of an API route to keep react-query as close to API as possible
    };

    return config;
  },
};

module.exports = nextConfig;
