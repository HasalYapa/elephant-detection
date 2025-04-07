/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Basic configuration
  reactStrictMode: false,
  swcMinify: true,

  // Image configuration
  images: {
    unoptimized: true,
  },

  // Static export
  output: 'export',

  // Disable experimental features
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  // Module resolution
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },
}

module.exports = nextConfig