/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cgmlroqsxmrlifsqgbom.supabase.co",
      },
    ],
  },
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
