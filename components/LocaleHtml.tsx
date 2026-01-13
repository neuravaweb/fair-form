'use client'

import { useEffect } from 'react'
import type { Locale } from '@/lib/i18n'

interface LocaleHtmlProps {
  locale: Locale
  children: React.ReactNode
}

export default function LocaleHtml({ locale, children }: LocaleHtmlProps) {
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return <>{children}</>
}
