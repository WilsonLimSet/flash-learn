const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove assetPrefix if you're not using a custom domain
  // assetPrefix: '',
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add this to ensure static files are handled correctly
  images: {
    unoptimized: true,
  },
  // Ensure output is set to export for static site generation
  output: 'export',
};

module.exports = withPWA(nextConfig); 