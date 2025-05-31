/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals = [...config.externals]
    return config
  },
  serverExternalPackages: []
}

module.exports = nextConfig 