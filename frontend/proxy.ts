import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    // TODO: Actual token validation logic would go here.
    // For now, we rely on client-side checks and backend guards.
    // This middleware is primarily for redirection and basic path protection if needed.

    const path = request.nextUrl.pathname;

    if (path === '/' && request.nextUrl.searchParams.has('ref')) {
        const canonicalUrl = request.nextUrl.clone();
        canonicalUrl.searchParams.delete('ref');
        return NextResponse.redirect(canonicalUrl, 308);
    }

    // Example: Redirect root /login to /login/student as default or a selection page
    // if (path === '/login') {
    //     return NextResponse.redirect(new URL('/login/student', request.url));
    // }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/login', '/dashboard/:path*'],
};
