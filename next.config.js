/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enhanced security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=*, microphone=*, display-capture=*'
          }
        ]
      }
    ]
  },

  // Webpack configuration for better bundling
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
  
  // Environment variables for build optimization
  env: {
    DISABLE_VERCEL_ANALYTICS: 'true',
    // Development
    NEXT_PUBLIC_SOCKET_URL: process.env.NODE_ENV === 'production' 
      ? 'https://meetopiaapp.onrender.com'
      : 'http://localhost:3003',
    NEXT_PUBLIC_APP_URL: process.env.NODE_ENV === 'production'
      ? 'https://meetopia.vercel.app'
      : 'http://localhost:4000',
  },

  transpilePackages: ['socket.io-client'],
  experimental: {
    // Remove esmExternals to fix warnings
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 