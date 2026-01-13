'use client'

import { getTranslations, type Locale } from '@/lib/i18n'
import { getCartelaName } from '@/lib/cartelaNames'
import type { Collection } from './CollectionSelector'

interface CartelaGridProps {
  collection: Collection
  selectedCartelas: number[]
  onSelectionChange: (cartelas: number[]) => void
  locale: Locale
}

// Define cartela ranges for each collection
const COLLECTION_CARTELAS: Record<Collection, number> = {
  'Sinope': 131, // Only 131 cartelas for Sinope
  'Premier Home': 87, // Only 87 cartelas for Premier Home
  'Decency': 74, // Only 74 cartelas for Decency
  'Magia': 96, // Only 96 cartelas for Magia
}

export default function CartelaGrid({ 
  collection, 
  selectedCartelas, 
  onSelectionChange,
  locale 
}: CartelaGridProps) {
  const t = getTranslations(locale)
  const totalCartelas = COLLECTION_CARTELAS[collection]
  
  const toggleCartela = (cartelaNumber: number) => {
    if (selectedCartelas.includes(cartelaNumber)) {
      onSelectionChange(selectedCartelas.filter(n => n !== cartelaNumber))
    } else {
      onSelectionChange([...selectedCartelas, cartelaNumber])
    }
  }

  return (
    <div className="w-full">
      <h4 className="text-lg font-luxury-heading text-luxury-gold mb-4">
        {collection} - {locale === 'pl' ? 'Próbki Kartonów' : 'Cardboard Samples'}
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {Array.from({ length: totalCartelas }, (_, i) => i + 1).map((cartelaNumber) => {
          const isSelected = selectedCartelas.includes(cartelaNumber)
          const cartelaName = getCartelaName(collection, cartelaNumber)
          const displayName = cartelaName.length > 15 
            ? `${cartelaName.substring(0, 15)}...` 
            : cartelaName
          
          return (
            <button
              key={cartelaNumber}
              type="button"
              onClick={() => toggleCartela(cartelaNumber)}
              className={`
                min-h-[60px] px-2 py-2 flex flex-col items-center justify-center
                text-xs sm:text-sm font-medium text-center
                transition-all duration-300
                ${isSelected 
                  ? 'gold-border bg-luxury-gold/10 text-luxury-gold shadow-[0_0_15px_rgba(201,162,77,0.4)]' 
                  : 'border border-luxury-gold/20 text-luxury-text-secondary hover:border-luxury-gold/40 hover:text-luxury-text'
                }
              `}
              title={cartelaName} // Full name on hover
            >
              <span className="leading-tight">{displayName}</span>
              {cartelaName !== cartelaNumber.toString() && (
                <span className="text-[10px] opacity-60 mt-1">#{cartelaNumber}</span>
              )}
            </button>
          )
        })}
      </div>
      {selectedCartelas.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-luxury-text-secondary mb-2">
            {selectedCartelas.length} {locale === 'pl' 
              ? `${selectedCartelas.length === 1 ? 'próbka' : 'próbki'} wybrano` 
              : `${selectedCartelas.length === 1 ? 'sample' : 'samples'} selected`
            }
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedCartelas.sort((a, b) => a - b).map((num) => (
              <span
                key={num}
                className="px-2 py-1 text-xs gold-border bg-luxury-gold/10 text-luxury-gold"
                title={getCartelaName(collection, num)}
              >
                {getCartelaName(collection, num)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
