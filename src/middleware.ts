import { NextRequest, NextResponse } from 'next/server'

/**
 * Maintenance mode middleware.
 *
 * Reads the maintenance state by calling the public API endpoint on
 * the same server. This avoids importing Prisma directly into the
 * middleware runtime (Edge compatibility).
 *
 * Excluded paths (always pass through):
 *  - /maintenance           – the maintenance page itself
 *  - /login                 – admin login
 *  - /admin                 – entire admin panel
 *  - /api                   – all API routes
 *  - /_next                 – Next.js internals
 *  - static assets          – images, fonts, etc.
 *
 * Logged-in users (identified by next-auth session cookie) always pass
 * through regardless of maintenance state, UNLESS the URL contains
 * ?preview parameter — in that case the session cookie is ignored
 * so the admin can see the site exactly as a visitor would.
 */
const SKIP_PREFIXES = [
  '/maintenance',
  '/login',
  '/admin',
  '/api',
  '/_next',
]

function isExcluded(pathname: string): boolean {
  for (const prefix of SKIP_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return true
  }
  if (/\.\w+$/.test(pathname)) return true
  return false
}

function hasSessionCookie(request: NextRequest): boolean {
  const cookieHeader = request.headers.get('cookie') ?? ''
  return (
    cookieHeader.includes('next-auth.session-token') ||
    cookieHeader.includes('__Secure-next-auth.session-token')
  )
}

// Simple in-memory cache with short TTL (seconds)
let _cached: boolean | null = null
let _cachedAt = 0
const CACHE_TTL = 5

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isExcluded(pathname)) return

  // ?preview = admin wants to see the site as a visitor
  const isPreview = request.nextUrl.searchParams.has('preview')

  // Logged-in users bypass maintenance (unless previewing)
  if (!isPreview && hasSessionCookie(request)) return

  const now = Date.now()
  let isMaintenance = false

  // Use in-memory cache with short TTL
  if (_cached !== null && now - _cachedAt < CACHE_TTL * 1000) {
    isMaintenance = _cached
  } else {
    try {
      const res = await fetch('http://localhost:3000/api/public/maintenance', {
        cache: 'no-store',
      })
      if (res.ok) {
        const data = await res.json()
        isMaintenance = !!data?.maintenance
        _cached = isMaintenance
        _cachedAt = now
      }
    } catch {
      // On any error, let the request through
      return
    }
  }

  if (isMaintenance) {
    const url = request.nextUrl.clone()
    url.pathname = '/maintenance'
    if (isPreview) url.searchParams.set('preview', '1')
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|logo\\.png|images/).*)'],
}
