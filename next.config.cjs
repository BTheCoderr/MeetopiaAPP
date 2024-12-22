/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
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
  distDir: '.next',
  generateEtags: false
}

export default nextConfig