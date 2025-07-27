/** @type {import('next').NextConfig} */
const config = {
  experimental: {
    optimizeCss: false, // Disable CSS optimization to avoid critters issues
    scrollRestoration: true,
  },
  output: 'standalone',
  
  // Skip static optimization for auth-protected pages
  exportPathMap: function () {
    return {
      '/': { page: '/' },
      // Exclude auth-protected pages from static generation
    };
  },
  
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent critters issues during build
      config.externals = config.externals || [];
      config.externals.push('critters');
    }
    return config;
  },
};

export default config;
