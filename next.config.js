/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      dns: false,
      tls: false,
      fs: false,
      'utf-8-validate': false,
      'bufferutil': false
    }
    return config
  },
  // Add experimental features for better CSS handling
  experimental: {
    optimizeCss: true,
    forceSwcTransforms: true
  },
  // Ensure CSS modules work correctly
  cssModules: true,
  // Add Render-specific settings
  distDir: '.next',
  generateEtags: false
}

module.exports = nextConfig