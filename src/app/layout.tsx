import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SITE_URL } from '@/lib/site'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Meetopia — Talk First. Vibe After.',
  description: 'Meetopia connects adults through live Chemistry Checks. Talk first, decide for yourself, then Vibe or move on. 18+ only.',
  keywords: 'video dating, live conversation, chemistry check, video chat, meet people, singles, dating app',
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
    description: 'Live video Chemistry Checks for adults. Talk first, then Vibe or move on. 18+ only.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Meetopia',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Meetopia — Video-first dating app',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meetopia — Talk First. Vibe After.',
    description: 'Live video Chemistry Checks for adults. Talk first, then Vibe or move on. 18+ only.',
    images: ['/og-image.png'],
  },
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
