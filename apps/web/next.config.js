/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@counselflow/ui", "@counselflow/shared"],
  
  // Enable static export for deployment
  output: 'export',
  trailingSlash: true,
  
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

  // Image optimization for static export
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    domains: [], // Add any external image domains here if needed
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

  // Environment variables for deployment
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
}

module.exports = nextConfig
