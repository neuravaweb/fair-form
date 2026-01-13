'use client'

import { getTranslations, type Locale } from '@/lib/i18n'

export type Collection = 'Sinope' | 'Premier Home' | 'Decency' | 'Magia'

interface CollectionSelectorProps {
  selectedCollections: Collection[]
  onSelectionChange: (collections: Collection[]) => void
  locale: Locale
}

const ALL_COLLECTIONS: Collection[] = ['Sinope', 'Premier Home', 'Decency', 'Magia']

export default function CollectionSelector({ 
  selectedCollections, 
  onSelectionChange,
  locale 
}: CollectionSelectorProps) {
  const t = getTranslations(locale)

  const toggleCollection = (collection: Collection) => {
    if (selectedCollections.includes(collection)) {
      // Remove collection
      onSelectionChange(selectedCollections.filter(c => c !== collection))
    } else {
      // Add collection
      onSelectionChange([...selectedCollections, collection])
    }
  }

  return (
    <div className="w-full mb-8">
      <h3 className="text-xl font-luxury-heading text-luxury-text mb-4">
        {locale === 'pl' ? 'Wybierz Kolekcje' : 'Select Collections'}
      </h3>
      <div className="flex flex-wrap gap-3">
        {ALL_COLLECTIONS.map((collection) => {
          const isSelected = selectedCollections.includes(collection)
          return (
            <button
              key={collection}
              type="button"
              onClick={() => toggleCollection(collection)}
              className={`
                px-6 py-3 text-base font-medium
                transition-all duration-300
                ${isSelected
                  ? 'gold-border bg-luxury-gold/20 text-luxury-gold shadow-[0_0_15px_rgba(201,162,77,0.4)]'
                  : 'border border-luxury-gold/20 text-luxury-text-secondary hover:border-luxury-gold/40 hover:text-luxury-text'
                }
              `}
            >
              {collection}
            </button>
          )
        })}
      </div>
      {selectedCollections.length > 0 && (
        <p className="mt-4 text-sm text-luxury-text-secondary">
          {selectedCollections.length} {locale === 'pl' ? 'kolekcji wybrano' : 'collections selected'}
        </p>
      )}
    </div>
  )
}
