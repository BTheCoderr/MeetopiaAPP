/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        "mongoose": require.resolve('mongoose'),
      },
      alias: {
        ...config.resolve.alias,
        '@': require('path').resolve(__dirname, './src'),
      },
    }
    return config
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose']
  }
}

module.exports = nextConfig 