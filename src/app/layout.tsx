import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'
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
  description: 'A platform for meeting and chatting with people from around the world through video, text, or combined chat.',
  keywords: 'video chat, text chat, meeting people, social platform, anonymous chat',
  authors: [{ name: 'Meetopia Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Meetopia - Connect with People Worldwide',
    description: 'Meet and chat with people from around the world through video, text, or combined chat.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Meetopia'
  },
  other: {
    'permissions-policy': 'camera=*, microphone=*, display-capture=*, geolocation=(), payment=(), usb=()'
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
        {children}
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
