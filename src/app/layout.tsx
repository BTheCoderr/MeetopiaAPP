import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { UserProvider } from '@/context/UserContext'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>MEETOPIA</title>
        <meta name="description" content="Your perfect meeting place" />
      </head>
      <body className={inter.className}>
        <UserProvider>
          <ThemeProvider>
            <Providers>{children}</Providers>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  )
}
