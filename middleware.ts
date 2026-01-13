import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { locales, defaultLocale, getLocaleFromPath } from '@/lib/i18n'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes (always in Polish)
  if (pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('admin-auth')
    
    if (!authCookie || authCookie.value !== 'authenticated') {
      if (pathname !== '/admin/login') {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }
    
    return NextResponse.next()
  }

  // Handle language routing for public pages
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // If pathname already has a locale, continue
  if (pathnameHasLocale) {
    return NextResponse.next()
  }

  // If root path, detect language and redirect
  if (pathname === '/') {
    const locale = getPreferredLocale(request)
    return NextResponse.redirect(new URL(`/${locale}`, request.url))
  }

  // For other paths without locale, redirect to default locale
  const locale = getPreferredLocale(request)
  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))
}

function getPreferredLocale(request: NextRequest): string {
  // Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  
  if (acceptLanguage) {
    // Parse Accept-Language header
    const languages = acceptLanguage
      .split(',')
      .map((lang) => {
        const [locale, q = '1'] = lang.trim().split(';q=')
        return { locale: locale.split('-')[0].toLowerCase(), quality: parseFloat(q) }
      })
      .sort((a, b) => b.quality - a.quality)

    // Check for Polish or English
    for (const { locale } of languages) {
      if (locale === 'pl') return 'pl'
      if (locale === 'en') return 'en'
    }
  }

  return defaultLocale
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
