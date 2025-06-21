import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>()

function rateLimit(ip: string, limit: number = 10, windowMs: number = 10000): boolean {
  const now = Date.now()
  const key = ip
  const requestData = requestCounts.get(key)

  if (!requestData || now > requestData.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (requestData.count >= limit) {
    return false
  }

  requestData.count++
  return true
}

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

// Paths that don't require special protection
const PUBLIC_PATHS = [
  '/',
  '/privacy',
  '/about',
  '/api/health',
  '/api/status',
  '/_next',
  '/favicon.ico',
  '/public',
  '/manifest.json',
]

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return response
  }

  // Get IP address for rate limiting
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0] || realIp || '127.0.0.1'

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    if (!rateLimit(ip, 15, 10000)) { // 15 requests per 10 seconds
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '10',
          'X-RateLimit-Limit': '15',
          'X-RateLimit-Remaining': '0',
        },
      })
    }
  }

  // Block suspicious requests (disabled for testing)
  // const userAgent = request.headers.get('user-agent')?.toLowerCase() || ''
  // const suspiciousPatterns = ['curl', 'wget', 'python-requests', 'postman']
  
  // if (suspiciousPatterns.some(pattern => userAgent.includes(pattern))) {
  //   // Block obvious automated tools (but allow real browsers)
  //   return new NextResponse('Forbidden', { status: 403 })
  // }

  // Validate origin for sensitive routes
  if (pathname.startsWith('/chat/') || pathname.startsWith('/api/match')) {
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      'http://localhost:3000',
      'https://meetopia-app.vercel.app',
      'https://meetopia-qpqrimjnj-bthecoders-projects.vercel.app'
    ]

    // For API routes, require proper origin
    if (pathname.startsWith('/api/') && origin && !allowedOrigins.includes(origin)) {
      return new NextResponse('Forbidden - Invalid Origin', { status: 403 })
  }
  }

  // Block requests with suspicious query parameters
  const searchParams = request.nextUrl.searchParams
  const suspiciousParams = ['<script', 'javascript:', 'data:', 'vbscript:']
  
  // Check each query parameter for suspicious content
  searchParams.forEach((value, key) => {
    if (suspiciousParams.some(pattern => 
      key.toLowerCase().includes(pattern) || 
      value.toLowerCase().includes(pattern)
    )) {
      return new NextResponse('Bad Request', { status: 400 })
    }
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 