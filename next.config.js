/** @type {import('next').NextConfig} */
const nextConfig = {
  // API routes configuration
  // Use webpack instead of Turbopack for Solana package externals support
  webpack: (config) => {
    // Externalize Solana packages to avoid build issues
    config.externals = config.externals || {};
    config.externals['@solana/kit'] = 'commonjs @solana/kit';
    config.externals['@solana-program/memo'] = 'commonjs @solana-program/memo';
    config.externals['@solana-program/system'] = 'commonjs @solana-program/system';
    config.externals['@solana-program/token'] = 'commonjs @solana-program/token';
    return config;
  },
  // Add empty turbopack config to silence the warning
  // Note: When using webpack config, you need to use --webpack flag or set this
  turbopack: {},
};

module.exports = nextConfig;

