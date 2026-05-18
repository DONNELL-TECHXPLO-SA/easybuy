/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  compress: true,
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
    formats: ["image/avif", "image/webp"],
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

module.exports = nextConfig;
