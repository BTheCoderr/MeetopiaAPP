import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Meetopia — Talk First. Vibe After.',
  description: 'Meetopia introduces adults through shared interests. Build a Chemistry Passport, both agree before video, then meet in an interactive Vibe Room. 18+ only.',
  keywords: 'video dating, chemistry passport, vibe room, consent-based introductions, shared activities, meaningful connections, 18+',
  authors: [{ name: 'Meetopia Team' }],
  robots: 'index, follow',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Meetopia',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'Meetopia — Talk First. Vibe After.',
    description: 'Consent-first introductions for adults: a Chemistry Passport, a mutual yes, then an interactive Vibe Room. 18+ only.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Meetopia',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Meetopia — Video-first dating app'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meetopia — Talk First. Vibe After.',
    description: 'Consent-first introductions for adults: a Chemistry Passport, a mutual yes, then an interactive Vibe Room. 18+ only.',
    images: ['/og-image.png']
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
