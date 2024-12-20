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
  }
}

module.exports = nextConfig