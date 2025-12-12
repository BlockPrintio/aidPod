/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  // Environment variables that need to be available on the client side
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // API route configuration
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  // Image configuration if using next/image
  images: {
    domains: ['supabase.co', 'ipfs.io'],
  },
}

module.exports = nextConfig
