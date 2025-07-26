const crypto = require('crypto');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@counselflow/ui", "@counselflow/shared"],
  
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Basic experimental features only
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Basic compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },

  // Simplified image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Minimal webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Only basic optimizations for production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      };
    }
    return config;
  },
}

module.exports = nextConfig
