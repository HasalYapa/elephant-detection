/** @type {import('next').NextConfig} */
const nextConfig = {
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
}

module.exports = nextConfig