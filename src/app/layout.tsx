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
  title: 'Meetopia - Random Video Chat with Strangers',
  description: 'Connect with random people worldwide through instant video chat. No sign-up required, completely free, and anonymous. Just click and start chatting!',
  keywords: 'video chat, random chat, meet strangers, omegle alternative, chatroulette, anonymous chat, video calls',
  authors: [{ name: 'Meetopia Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Meetopia - Random Video Chat with Strangers',
    description: 'Connect with random people through instant video chat. No sign-up required, completely free!',
    type: 'website',
    locale: 'en_US',
    siteName: 'Meetopia',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Meetopia - Random Video Chat App'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meetopia - Random Video Chat with Strangers',
    description: 'Connect with random people through instant video chat. No sign-up required!',
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
