import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
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
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
