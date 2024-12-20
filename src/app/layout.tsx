import { UserProvider } from '../context/UserContext'
import './globals.css'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <UserProvider>
            {children}
          </UserProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
