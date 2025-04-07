/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'vercel.app', 'elephant-detection.vercel.app'],
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL || 'http://localhost:8080/api/:path*', // Use environment variable in production
      },
    ]
  },
  // Disable server-side image optimization for Vercel deployment
  output: 'standalone',
  // Skip export errors
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  // Explicitly configure module resolution
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },
}

module.exports = nextConfig