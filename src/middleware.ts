import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
    '/admin',
    '/employee',
    '/super-admin',
    '/college',
    '/industry',
];

const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionToken = request.cookies.get('firebase-auth-token')?.value;

    if (!sessionToken && protectedRoutes.some(path => pathname.startsWith(path))) {
        const absoluteURL = new URL('/login', request.url);
        return NextResponse.redirect(absoluteURL.toString());
    }

    if (sessionToken && authRoutes.some(path => pathname.startsWith(path))) {
        // Assume default redirect, AuthProvider will handle role-specific redirect
        const absoluteURL = new URL('/employee/dashboard', request.url);
        return NextResponse.redirect(absoluteURL.toString());
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/employee/:path*',
        '/super-admin/:path*',
        '/college/:path*',
        '/industry/:path*',
        '/login',
        '/signup',
    ],
};
