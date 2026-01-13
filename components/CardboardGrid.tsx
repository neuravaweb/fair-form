'use client'

import { useState } from 'react'
import { getTranslations, type Locale } from '@/lib/i18n'

interface CardboardGridProps {
  selectedCards: number[]
  onSelectionChange: (cards: number[]) => void
  locale: Locale
}

export default function CardboardGrid({ selectedCards, onSelectionChange, locale }: CardboardGridProps) {
  const t = getTranslations(locale)
  const totalCards = 144
  
  const toggleCard = (cardNumber: number) => {
    if (selectedCards.includes(cardNumber)) {
      onSelectionChange(selectedCards.filter(n => n !== cardNumber))
    } else {
      onSelectionChange([...selectedCards, cardNumber])
    }
  }

  return (
    <div className="w-full">
      <h3 className="text-xl font-luxury-heading text-luxury-text mb-6">
        {t.form.cardboardSelection}
      </h3>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3 sm:gap-4">
        {Array.from({ length: totalCards }, (_, i) => i + 1).map((cardNumber) => {
          const isSelected = selectedCards.includes(cardNumber)
          return (
            <button
              key={cardNumber}
              type="button"
              onClick={() => toggleCard(cardNumber)}
              className={`
                aspect-square flex items-center justify-center
                text-sm sm:text-base font-medium
                transition-all duration-300
                ${isSelected 
                  ? 'gold-border bg-luxury-gold/10 text-luxury-gold shadow-[0_0_15px_rgba(201,162,77,0.4)]' 
                  : 'border border-luxury-gold/20 text-luxury-text-secondary hover:border-luxury-gold/40 hover:text-luxury-text'
                }
              `}
            >
              {cardNumber}
            </button>
          )
        })}
      </div>
      {selectedCards.length > 0 && (
        <p className="mt-4 text-sm text-luxury-text-secondary">
          {locale === 'pl' 
            ? `${selectedCards.length} ${selectedCards.length === 1 ? t.form.sample : t.form.samples} wybrano`
            : `${selectedCards.length} ${selectedCards.length === 1 ? t.form.sample : t.form.samples} selected`
          }
        </p>
      )}
    </div>
  )
}
