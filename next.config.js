// The temporary Render hosting branch is not a production release branch.
require('./scripts/render-staging-guard.cjs').assertRenderStagingWeb(process.env)

// Fail at build time if a preview Netlify project would accidentally use the
// live Meetopia database or live signaling server.
if (process.env.MEETOPIA_DEPLOY_ENV === 'staging' && process.env.MEETOPIA_STAGING_DB_PROVIDER !== 'render') {
  const ref = process.env.MEETOPIA_STAGING_DB_REF;
  const stagingSocket = process.env.NEXT_PUBLIC_SOCKET_URL;
  const stagingWeb = process.env.MEETOPIA_STAGING_WEB_URL;
  if (!ref || !/^[a-z0-9]{20}$/.test(ref) || !stagingWeb || !stagingSocket) {
    throw new Error('Staging web build requires its own DB ref and both staging host URLs.');
  }
  const u = new URL(stagingSocket);
  const w = new URL(stagingWeb);
  if (u.protocol !== 'https:' || w.protocol !== 'https:' ||
      u.hostname === 'meetopia-signaling-v2.onrender.com' ||
      w.hostname === 'meetopia-live.netlify.app') {
    throw new Error('Refusing to build staging against a production Meetopia host.');
  }
  const configured = ['MEETOPIA_DATABASE_URL', 'DATABASE_URL', 'DATABASE_URL_UNPOOLED']
    .map(key => [key, process.env[key]]).filter(([, value]) => Boolean(value));
  if (!configured.length) throw new Error('Staging requires dedicated database credentials.');
  for (const [key, value] of configured) {
    const parsed = new URL(value);
    const valid = parsed.hostname === `db.${ref}.supabase.co` ||
      (parsed.hostname.endsWith('.pooler.supabase.com') && decodeURIComponent(parsed.username) === `postgres.${ref}`);
    if (!valid || !['postgres:', 'postgresql:'].includes(parsed.protocol)) {
      throw new Error(`Refusing ${key}: staging credentials must use the approved isolated Supabase branch.`);
    }
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/marketing',
        destination: '/',
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          ...(process.env.MEETOPIA_DEPLOY_ENV === 'staging' ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : []),
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(self), display-capture=(self), geolocation=(), payment=(), usb=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        dns: false,
        tls: false,
        fs: false,
      }
    }
    return config
  },
  compiler: {
    styledComponents: true,
    reactRemoveProperties: {
      properties: [
        '^data-new-gr-c-s-check-loaded$',
        '^data-gr-ext-installed$',
        '^cz-shortcut-listen$',
      ],
    },
  },
}

module.exports = nextConfig
