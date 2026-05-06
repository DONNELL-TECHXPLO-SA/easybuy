/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cgmlroqsxmrlifsqgbom.supabase.co",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
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
