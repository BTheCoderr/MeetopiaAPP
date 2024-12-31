import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/auth/signin',
  '/auth/signup',
  '/api/auth/signin',
  '/api/auth/signup',
  '/',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get('meetopia_session')

  // If no session, redirect to signin
  if (!sessionCookie) {
    const signinUrl = new URL('/auth/signin', request.url)
    signinUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(signinUrl)
  }

  return NextResponse.next()
}

// Configure paths that trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 