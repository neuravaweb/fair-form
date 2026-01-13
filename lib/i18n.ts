import plTranslations from '@/locales/pl.json'
import enTranslations from '@/locales/en.json'

export type Locale = 'pl' | 'en'

export const locales: Locale[] = ['pl', 'en']
export const defaultLocale: Locale = 'pl'

export const translations = {
  pl: plTranslations,
  en: enTranslations,
}

export function getTranslations(locale: Locale) {
  return translations[locale] || translations[defaultLocale]
}

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  
  if (firstSegment === 'pl' || firstSegment === 'en') {
    return firstSegment as Locale
  }
  
  return defaultLocale
}

export function getLocalizedPath(pathname: string, locale: Locale): string {
  const segments = pathname.split('/').filter(Boolean)
  
  // Remove existing locale if present
  if (segments[0] === 'pl' || segments[0] === 'en') {
    segments.shift()
  }
  
  // Remove 'admin' from path for admin routes (admin stays in Polish)
  if (segments[0] === 'admin') {
    return pathname // Admin routes don't get localized
  }
  
  const path = segments.length > 0 ? `/${segments.join('/')}` : ''
  return `/${locale}${path}`
}
