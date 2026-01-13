'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getLocalizedPath, type Locale } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n'

interface LanguageSwitcherProps {
  currentLocale: Locale
}

export default function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname()
  const router = useRouter()
  const t = getTranslations(currentLocale)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      // Show when at the top (within 100px), hide when scrolled down
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      setIsVisible(scrollTop < 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const switchLanguage = (newLocale: Locale) => {
    const newPath = getLocalizedPath(pathname, newLocale)
    router.push(newPath)
  }

  return (
    <div 
      className={`
        flex gap-2 bg-luxury-black/80 backdrop-blur-sm p-1 rounded-sm
        transition-all duration-300
        ${isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 -translate-y-2 pointer-events-none'
        }
      `}
    >
      <button
        onClick={() => switchLanguage('pl')}
        className={`
          px-4 py-2 gold-border text-sm font-medium transition-all duration-300
          ${currentLocale === 'pl' 
            ? 'bg-luxury-gold/20 text-luxury-gold border-luxury-gold shadow-[0_0_10px_rgba(201,162,77,0.3)]' 
            : 'text-luxury-text-secondary hover:text-luxury-text hover:border-luxury-gold/60 hover:bg-luxury-gold/5'
          }
        `}
      >
        PL
      </button>
      <button
        onClick={() => switchLanguage('en')}
        className={`
          px-4 py-2 gold-border text-sm font-medium transition-all duration-300
          ${currentLocale === 'en' 
            ? 'bg-luxury-gold/20 text-luxury-gold border-luxury-gold shadow-[0_0_10px_rgba(201,162,77,0.3)]' 
            : 'text-luxury-text-secondary hover:text-luxury-text hover:border-luxury-gold/60 hover:bg-luxury-gold/5'
          }
        `}
      >
        EN
      </button>
    </div>
  )
}
