/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals = [...config.externals]
    return config
  },
  experimental: {
    serverComponentsExternalPackages: []
  },
  compiler: {
    styledComponents: true,
    reactRemoveProperties: { properties: ['^data-new-gr-c-s-check-loaded$', '^data-gr-ext-installed$', '^cz-shortcut-listen$'] }
  }
}

module.exports = nextConfig 