import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Meetopia — Video-First Dating for Real Chemistry',
  description: 'Meetopia is profile-based, video-first dating. Create a profile, choose your intent, browse suggested matches, and request a Chemistry Check. 18+ only.',
  keywords: 'video dating, dating app, chemistry check, profile-based dating, meet people, singles, local dating, new friends',
  authors: [{ name: 'Meetopia Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Meetopia — Video-First Dating for Real Chemistry',
    description: 'Profile-based, video-first dating. Browse suggested matches and request a Chemistry Check. 18+ only.',
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
    title: 'Meetopia — Video-First Dating for Real Chemistry',
    description: 'Profile-based, video-first dating. Browse suggested matches and request a Chemistry Check. 18+ only.',
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
