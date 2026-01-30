import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for assets and API routes
  if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Protect admin routes (both /admin and /shop/admin), but allow access to login pages
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/shop/admin');
  const isAdminLoginPage = pathname === '/admin/login' || pathname === '/shop/admin/login';
  
  if (isAdminRoute && !isAdminLoginPage) {
    const token = request.cookies.get('admin-token')?.value;

    // Determine the correct login URL based on the pathname
    const loginPath = pathname.startsWith('/shop/admin') ? '/shop/admin/login' : '/admin/login';
    const loginUrl = new URL(loginPath, request.url);

    if (!token) {
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (err) {
      console.error('Middleware token verification error:', err);
      loginUrl.searchParams.set('from', pathname);
      loginUrl.searchParams.set('error', 'Session expired');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
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
    '/admin/:path*',
    '/shop/admin/:path*'
  ],
};
