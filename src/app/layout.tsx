import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
import { ThemeProvider } from '../components/ThemeProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Meetopia - Connect with People Worldwide',
  description: 'Advanced video chat platform with smart matching, virtual backgrounds, screen sharing, and enterprise-grade security. Connect with confidence.',
  keywords: 'video chat, text chat, meeting people, social platform, anonymous chat, virtual backgrounds, screen sharing, smart matching',
  authors: [{ name: 'Meetopia Team' }],
  robots: 'index, follow',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Meetopia',
    startupImage: [
      '/icons/apple-splash-2048-2732.jpg',
      '/icons/apple-splash-1668-2224.jpg',
      '/icons/apple-splash-1536-2048.jpg',
      '/icons/apple-splash-1125-2436.jpg',
      '/icons/apple-splash-1242-2208.jpg',
      '/icons/apple-splash-750-1334.jpg',
      '/icons/apple-splash-828-1792.jpg'
    ]
  },
  openGraph: {
    title: 'Meetopia - Connect with People Worldwide',
    description: 'Advanced video chat platform with smart matching, virtual backgrounds, and enterprise-grade security.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Meetopia',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Meetopia - Connect with People Worldwide'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meetopia - Connect with People Worldwide',
    description: 'Advanced video chat platform with smart matching and virtual backgrounds.',
    images: ['/og-image.png']
  },
  other: {
    'permissions-policy': 'camera=*, microphone=*, display-capture=*, geolocation=(), payment=(), usb=()',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Conditionally disable analytics to prevent 429 errors
  const isAnalyticsEnabled = process.env.NODE_ENV === 'production' && 
                            !process.env.DISABLE_VERCEL_ANALYTICS &&
                            process.env.VERCEL_ENV !== 'preview'

  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Permissions-Policy" content="camera=*, microphone=*, display-capture=*, geolocation=(), payment=(), usb=()" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        {isAnalyticsEnabled && (
          <>
            <SpeedInsights />
            <Analytics />
          </>
        )}
      </body>
    </html>
  )
}
