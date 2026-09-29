import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/privacy',
  '/terms',
  '/community-guidelines',
  '/support',
  '/safety',
]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(path => {
    if (path === '/') return pathname === '/'
    return pathname === path || pathname.startsWith(`${path}/`)
  })
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = (forwardedHost || request.headers.get('host') || '').split(':')[0].toLowerCase()

  if (host === 'meeetopia.netlify.app') {
    const canonical = request.nextUrl.clone()
    canonical.protocol = 'https:'
    canonical.host = 'meetopia-live.netlify.app'
    canonical.port = ''
    return NextResponse.redirect(canonical, 308)
  }

  // API handlers return their own 401/403 responses and should never be redirected to HTML.
  if (pathname.startsWith('/api/') || isPublicPath(pathname)) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get('meetopia_session')
  if (!sessionCookie) {
    const signinUrl = new URL('/auth/signin', request.url)
    signinUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(signinUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
