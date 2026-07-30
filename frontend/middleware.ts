import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Các trang xác thực (chỉ cho phép truy cập khi chưa đăng nhập)
  const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Các trang yêu cầu đăng nhập
  const protectedRoutes = ['/dashboard', '/projects', '/workspaces', '/settings'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Nếu đã đăng nhập mà truy cập trang auth (login, signup...) -> chuyển hướng sang dashboard
  if (refreshToken && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Nếu chưa đăng nhập mà truy cập trang bảo vệ -> chuyển hướng sang login
  if (!refreshToken && isProtectedRoute) {
    const loginUrl = new URL('/login', request.url);
    // Lưu lại URL đang muốn vào để sau khi login xong có thể redirect lại
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Nếu truy cập root (/) và đã đăng nhập -> chuyển sang dashboard
  if (pathname === '/' && refreshToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Chạy middleware trên tất cả các route ngoại trừ tài nguyên tĩnh, images, favicon và các route API
  matcher: [
    '/((?!api|_next/static|_next/image|assets|vercel.svg|next.svg|file.svg|globe.svg|window.svg|favicon.ico).*)',
  ],
};
