import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from './src/lib/auth';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Paths that don't require authentication
    const isAuthPage = pathname === '/login' || pathname === '/register';
    const isApiAuth = pathname.startsWith('/api/auth');

    if (isApiAuth) return NextResponse.next();

    if (!token) {
        if (isAuthPage) return NextResponse.next();
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Token exists
    if (isAuthPage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
