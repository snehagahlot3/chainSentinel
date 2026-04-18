import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  const isApiAuth = request.nextUrl.pathname.startsWith('/api/auth')
  const isEcommerce = request.nextUrl.pathname.startsWith('/ecommerce')
  const isSupplier = request.nextUrl.pathname.startsWith('/supplier')

  if (isApiAuth || isAuthPage || isEcommerce || isSupplier) {
    return NextResponse.next()
  }

  if (!token && isDashboard) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/api/auth/:path*', '/ecommerce/:path*', '/supplier/:path*']
}