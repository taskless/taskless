/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverRuntimeConfig: {
    mongod: require("./server/mongo"),
    crond: require("./server/cron"),
  },
};

module.exports = nextConfig;
