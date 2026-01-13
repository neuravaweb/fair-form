import { getTranslations } from '@/lib/i18n'
import HeroSection from '@/components/HeroSection'
import ImageCarousel from '@/components/ImageCarousel'
import CustomerForm from '@/components/CustomerForm'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import type { Locale } from '@/lib/i18n'

export async function generateMetadata({ params }: { params: { locale: Locale } }) {
  const t = getTranslations(params.locale)
  
  return {
    title: params.locale === 'pl' 
      ? 'Fabric Fair - Premiumowe Rozwiązania Tekstylne'
      : 'Fabric Fair - Premium Fabric Solutions',
    description: t.hero.subtitle,
    alternates: {
      canonical: `/${params.locale}`,
      languages: {
        'pl': '/pl',
        'en': '/en',
      },
    },
  }
}

export default function Home({ params }: { params: { locale: Locale } }) {
  // Carousel images
  const carouselImages = [
    '/carousel-example/assets/AYR09164 kopya.jpg',
    '/carousel-example/assets/AYR09178 kopya.jpg',
    '/carousel-example/assets/AYR09185 kopya.jpg',
    '/carousel-example/assets/AYR09187 kopya.jpg',
    '/carousel-example/assets/AYR09218 kopya.jpg',
    '/carousel-example/assets/AYR09226 kopya.jpg',
    '/carousel-example/assets/AYR09233 kopya.jpg',
    '/carousel-example/assets/AYR09235 kopya.jpg',
    '/carousel-example/assets/AYR09264 kopya.jpg',
  ]

  return (
    <main className="min-h-screen relative">
      <div className="fixed top-4 right-4 z-[100]">
        <LanguageSwitcher currentLocale={params.locale} />
      </div>
      <HeroSection locale={params.locale} />
      {carouselImages.length > 0 && (
        <ImageCarousel images={carouselImages} interval={4000} />
      )}
      <CustomerForm locale={params.locale} />
    </main>
  )
}
