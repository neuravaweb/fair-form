import type { Metadata } from 'next'
import type { Locale } from '@/lib/i18n'
import LocaleHtml from '@/components/LocaleHtml'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: Locale }
}) {
  return <LocaleHtml locale={params.locale}>{children}</LocaleHtml>
}
