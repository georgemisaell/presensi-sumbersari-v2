import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const role = token?.role;
    const path = req.nextUrl.pathname;

    // Jika mengakses root (/), redirect sesuai role
    if (path === '/') {
      if (role === 'Admin') {
        return NextResponse.redirect(new URL('/admin/home', req.url));
      } else if (role === 'Pegawai') {
        return NextResponse.redirect(new URL('/pegawai/home', req.url));
      }
    }

    // Proteksi route /admin
    if (path.startsWith('/admin') && role !== 'Admin') {
      return NextResponse.redirect(new URL('/pegawai/home', req.url));
    }

    // Proteksi route /pegawai
    if (path.startsWith('/pegawai') && role !== 'Pegawai') {
      return NextResponse.redirect(new URL('/admin/home', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: ['/', '/admin/:path*', '/pegawai/:path*'],
};
