/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    // use global eslint
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
