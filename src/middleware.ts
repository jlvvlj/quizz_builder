import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Pages reachable without a session.
const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password']

// Pages a signed-in user should be bounced away from.
const SIGNED_OUT_ONLY_PATHS = ['/login', '/signup']

export function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl
    const userId = req.cookies.get('userId')?.value
    const isSignedIn = Boolean(userId) && userId !== 'anonymous'

    if (!isSignedIn && !PUBLIC_PATHS.includes(pathname)) {
        const loginUrl = req.nextUrl.clone()
        loginUrl.pathname = '/login'
        loginUrl.search = ''
        if (pathname !== '/') {
            loginUrl.searchParams.set('redirect', pathname + search)
        }
        return NextResponse.redirect(loginUrl)
    }

    if (isSignedIn && SIGNED_OUT_ONLY_PATHS.includes(pathname)) {
        const appUrl = req.nextUrl.clone()
        appUrl.pathname = '/jalingo'
        appUrl.search = ''
        return NextResponse.redirect(appUrl)
    }

    return NextResponse.next()
}

export const config = {
    // Run on every route except API routes, Next internals, and static assets.
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
