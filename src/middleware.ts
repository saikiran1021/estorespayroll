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
    
    // This cookie is set by Firebase Auth on the client, and middleware runs on the server.
    // This check is not reliable for server-side route protection with client-side auth.
    // The AuthProvider component handles this logic more effectively on the client-side.
    // We will rely on the AuthProvider for redirects.

    // For example, if a user is not logged in and tries to access a protected route,
    // the AuthProvider will detect this and redirect them to /login.
    // If a user IS logged in and tries to access /login, the AuthProvider will
    // redirect them to their appropriate dashboard.

    return NextResponse.next();
}

export const config = {
    // We still need the matcher to run the middleware on these routes,
    // even though the logic inside is simplified.
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
