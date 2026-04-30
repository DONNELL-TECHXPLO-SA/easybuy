/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
