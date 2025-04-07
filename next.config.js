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
    domains: ['localhost', 'vercel.app', 'elephant-detection.vercel.app', 'elephant-detection.netlify.app'],
    unoptimized: true,
    loader: 'custom',
    loaderFile: './src/lib/image-loader.js',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL || 'http://localhost:8080/api/:path*', // Use environment variable in production
      },
    ]
  },
  // Use export for static site generation
  output: 'export',
  // Skip export errors and configure for static export
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  trailingSlash: true,
  distDir: '.next',

  // Explicitly configure module resolution
  webpack: (config) => {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },
}

module.exports = nextConfig