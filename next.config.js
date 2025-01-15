/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals = [...config.externals]
    return config
  },
  experimental: {
    serverComponentsExternalPackages: []
  }
}

module.exports = nextConfig 