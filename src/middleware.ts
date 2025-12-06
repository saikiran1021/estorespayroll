import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
    '/admin/dashboard',
    '/employee/dashboard',
    '/super-admin/dashboard',
    '/college/dashboard',
    '/industry/dashboard',
];

const authRoutes = ['/login', '/signup'];

const roleRoutes: Record<string, string[]> = {
    'Admin': ['/admin/dashboard', '/industry/dashboard'],
    'Employee': ['/employee/dashboard', '/college/dashboard', '/industry/dashboard'],
    'Super Admin': ['/super-admin/dashboard'],
    'College': ['/college/dashboard'],
    'Industry': ['/industry/dashboard'],
}

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
        '/admin/dashboard/:path*',
        '/employee/dashboard/:path*',
        '/super-admin/dashboard/:path*',
        '/college/dashboard/:path*',
        '/industry/dashboard/:path*',
        '/login',
        '/signup',
    ],
};
