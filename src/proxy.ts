import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export function proxy(req: NextRequest) {
  if (!['/login', '/signup'].includes(req.nextUrl.pathname) && !req.cookies.get('quiz_session')?.value) return NextResponse.redirect(new URL('/login', req.url));
  // Presence only here; every API verifies the opaque token against the database.
  return NextResponse.next();
}
export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'] };
