import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fabric Fair - Premium Textile Solutions',
  description: 'Professional B2B fabric solutions for international fairs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  )
}
