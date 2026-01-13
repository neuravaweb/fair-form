'use client'

import { getTranslations, type Locale } from '@/lib/i18n'
import Image from 'next/image'

interface HeroSectionProps {
  locale: Locale
}

export default function HeroSection({ locale }: HeroSectionProps) {
  const t = getTranslations(locale)
  
  const backgroundImage = '/images/sinope1.png'

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#010101] z-0"></div>
      
      {/* Logo Image - Centered and Smaller */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative w-[500px] h-[375px] sm:w-[650px] sm:h-[488px] md:w-[800px] md:h-[600px] opacity-30">
          <Image
            src={backgroundImage}
            alt="SINOPE - World of Fabrics"
            fill
            className="object-contain"
            priority
            quality={90}
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto text-center animate-fade-in relative z-20">
        <div className="mb-8">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-luxury-gold to-transparent mx-auto mb-8"></div>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-luxury-heading font-bold text-luxury-text mb-6 leading-tight drop-shadow-lg">
          {t.hero.title}
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-luxury-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
          {t.hero.subtitle}
        </p>
        
        <p className="text-base sm:text-lg text-luxury-text-secondary mb-12 max-w-xl mx-auto drop-shadow-md">
          {t.hero.description}
        </p>
        
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-luxury-gold to-transparent mx-auto mt-8"></div>
      </div>
    </section>
  )
}
