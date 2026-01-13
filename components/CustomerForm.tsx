'use client'

import { useState, FormEvent, useRef } from 'react'
import CollectionSelector, { type Collection } from './CollectionSelector'
import CartelaGrid from './CartelaGrid'
import Captcha, { type CaptchaRef } from './Captcha'
import { getTranslations, type Locale } from '@/lib/i18n'

interface FormErrors {
  companyName?: string
  nip?: string
  country?: string
  postalCode?: string
  city?: string
  street?: string
  buildingNumber?: string
  phone?: string
  email?: string
  collections?: string
}

interface CollectionSelection {
  collection: Collection
  cartelas: number[]
}

interface CustomerFormProps {
  locale: Locale
}

export default function CustomerForm({ locale }: CustomerFormProps) {
  const t = getTranslations(locale)
  const captchaRef = useRef<CaptchaRef>(null)
  const [sessionId] = useState(() => `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  
  const [formData, setFormData] = useState({
    companyName: '',
    nip: '',
    country: '',
    postalCode: '',
    city: '',
    street: '',
    buildingNumber: '',
    apartmentNumber: '',
    phone: '',
    email: '',
    notes: '',
  })
  
  const [selectedCollections, setSelectedCollections] = useState<Collection[]>([])
  const [collectionCartelas, setCollectionCartelas] = useState<Record<Collection, number[]>>({
    'Sinope': [],
    'Premier Home': [],
    'Decency': [],
    'Magia': [],
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validateNIP = (nip: string): boolean => {
    const digitsOnly = nip.replace(/\D/g, '')
    return digitsOnly.length === 10
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.companyName.trim()) {
      newErrors.companyName = t.form.errors.companyNameRequired
    }

    if (!formData.nip.trim()) {
      newErrors.nip = t.form.errors.nipRequired
    } else if (!validateNIP(formData.nip)) {
      newErrors.nip = t.form.errors.nipInvalid
    }

    if (!formData.country.trim()) {
      newErrors.country = t.form.errors.countryRequired
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = t.form.errors.postalCodeRequired
    }

    if (!formData.city.trim()) {
      newErrors.city = t.form.errors.cityRequired
    }

    if (!formData.street.trim()) {
      newErrors.street = t.form.errors.streetRequired
    }

    if (!formData.buildingNumber.trim()) {
      newErrors.buildingNumber = t.form.errors.buildingNumberRequired
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t.form.errors.phoneRequired
    }

    if (!formData.email.trim()) {
      newErrors.email = t.form.errors.emailRequired
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t.form.errors.emailInvalid
    }

    // Validate that at least one collection has cartelas selected
    const hasCartelas = selectedCollections.some(
      collection => collectionCartelas[collection].length > 0
    )
    
    if (!hasCartelas) {
      newErrors.collections = locale === 'pl' 
        ? 'Proszę wybrać przynajmniej jedną próbkę z wybranych kolekcji'
        : 'Please select at least one sample from the selected collections'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCollectionChange = (collections: Collection[]) => {
    setSelectedCollections(collections)
    
    // Clear cartelas for deselected collections
    const updatedCartelas = { ...collectionCartelas }
    Object.keys(updatedCartelas).forEach((collection) => {
      if (!collections.includes(collection as Collection)) {
        updatedCartelas[collection as Collection] = []
      }
    })
    setCollectionCartelas(updatedCartelas)
  }

  const handleCartelaChange = (collection: Collection, cartelas: number[]) => {
    setCollectionCartelas({
      ...collectionCartelas,
      [collection]: cartelas,
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Verify captcha first
    if (captchaRef.current) {
      const captchaValid = await captchaRef.current.verify()
      if (!captchaValid) {
        return
      }
    }

    setIsSubmitting(true)

    // Build collection-based data structure
    const collectionsData: CollectionSelection[] = selectedCollections
      .filter(collection => collectionCartelas[collection].length > 0)
      .map(collection => ({
        collection,
        cartelas: collectionCartelas[collection].sort((a, b) => a - b),
      }))

    try {
      // Get user input from captcha component for backend verification
      // The server will verify against the stored captcha in the session
      // We pass the sessionId so server can look up the verified captcha
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          collections: collectionsData,
          sessionId, // Server will verify the already-verified captcha
        }),
      })

      if (response.ok) {
        setSubmitSuccess(true)
        // Refresh captcha on success
        if (captchaRef.current) {
          captchaRef.current.refresh()
        }
        setFormData({
          companyName: '',
          nip: '',
          country: '',
          postalCode: '',
          city: '',
          street: '',
          buildingNumber: '',
          apartmentNumber: '',
          phone: '',
          email: '',
          notes: '',
        })
        setSelectedCollections([])
        setCollectionCartelas({
          'Sinope': [],
          'Premier Home': [],
          'Decency': [],
          'Magia': [],
        })
        setErrors({})
        
        setTimeout(() => {
          setSubmitSuccess(false)
        }, 5000)
      } else {
        const data = await response.json()
        const errorMsg = data.error || 'Unknown error'
        if (data.blocked && data.remainingTime) {
          alert(`${errorMsg} (${locale === 'pl' ? 'Spróbuj ponownie za' : 'Try again in'} ${data.remainingTime} ${locale === 'pl' ? 'sekund' : 'seconds'})`)
        } else {
          alert('Error submitting form: ' + errorMsg)
        }
        // Refresh captcha on error
        if (captchaRef.current) {
          captchaRef.current.refresh()
        }
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert('Error submitting form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNIPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 10) {
      setFormData({ ...formData, nip: value })
      if (errors.nip) {
        setErrors({ ...errors, nip: undefined })
      }
    }
  }

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#010101]">
      <div className="max-w-6xl mx-auto">
        <div className="gold-border bg-luxury-black/50 p-8 sm:p-12">
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-luxury-heading text-luxury-text mb-4">
              {t.form.title}
            </h2>
            <p className="text-luxury-text-secondary text-base sm:text-lg">
              {t.form.description}
            </p>
          </div>

          {submitSuccess && (
            <div className="mb-6 p-4 gold-border bg-luxury-gold/10 text-luxury-gold">
              <p className="font-medium">{t.form.success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Collection Selector */}
            <CollectionSelector
              selectedCollections={selectedCollections}
              onSelectionChange={handleCollectionChange}
              locale={locale}
            />

            {/* Cartela Grids for Selected Collections */}
            {selectedCollections.length > 0 && (
              <div className="space-y-8">
                {selectedCollections.map((collection) => (
                  <div key={collection} className="gold-border p-6 bg-luxury-black/30">
                    <CartelaGrid
                      collection={collection}
                      selectedCartelas={collectionCartelas[collection]}
                      onSelectionChange={(cartelas) => handleCartelaChange(collection, cartelas)}
                      locale={locale}
                    />
                  </div>
                ))}
              </div>
            )}

            {errors.collections && (
              <div className="p-4 border border-red-400/50 bg-red-400/10 text-red-400">
                <p className="text-sm">{errors.collections}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-luxury-text mb-2 font-medium">
                  {t.form.companyName} <span className="text-luxury-gold">{t.form.required}</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => {
                    setFormData({ ...formData, companyName: e.target.value })
                    if (errors.companyName) {
                      setErrors({ ...errors, companyName: undefined })
                    }
                  }}
                  className="w-full px-4 py-3 bg-luxury-black gold-border text-luxury-text focus:outline-none focus:border-luxury-gold transition-colors"
                  required
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-400">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label htmlFor="nip" className="block text-luxury-text mb-2 font-medium">
                  {t.form.nip} <span className="text-luxury-gold">{t.form.required}</span>
                </label>
                <input
                  type="text"
                  id="nip"
                  value={formData.nip}
                  onChange={handleNIPChange}
                  placeholder={t.form.nipPlaceholder}
                  className="w-full px-4 py-3 bg-luxury-black gold-border text-luxury-text focus:outline-none focus:border-luxury-gold transition-colors"
                  required
                />
                {errors.nip && (
                  <p className="mt-1 text-sm text-red-400">{errors.nip}</p>
                )}
                {formData.nip && !errors.nip && formData.nip.length === 10 && (
                  <p className="mt-1 text-sm text-luxury-gold">{t.form.nipValid}</p>
                )}
              </div>

              {/* Address Section */}
              <div className="md:col-span-2">
                <label className="block text-luxury-text mb-2 font-medium">
                  {t.form.deliveryAddress} <span className="text-luxury-gold">{t.form.required}</span>
                </label>
              </div>

              <div>
                <label htmlFor="country" className="block text-luxury-text mb-2 font-medium">
                  {t.form.country} <span className="text-luxury-gold">{t.form.required}</span>
                </label>
                <input
                  type="text"
                  id="country"
                  value={formData.country}
                  onChange={(e) => {
                    setFormData({ ...formData, country: e.target.value })
                    if (errors.country) {
                      setErrors({ ...errors, country: undefined })
                    }
                  }}
                  className="w-full px-4 py-3 bg-luxury-black gold-border text-luxury-text focus:outline-none focus:border-luxury-gold transition-colors"
                  required
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-400">{errors.country}</p>
                )}
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-luxury-text mb-2 font-medium">
                  {t.form.postalCode} <span className="text-luxury-gold">{t.form.required}</span>
                </label>
                <input
                  type="text"
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => {
                    setFormData({ ...formData, postalCode: e.target.value })
                    if (errors.postalCode) {
                      setErrors({ ...errors, postalCode: undefined })
                    }
                  }}
                  className="w-full px-4 py-3 bg-luxury-black gold-border text-luxury-text focus:outline-none focus:border-luxury-gold transition-colors"
                  required
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-400">{errors.postalCode}</p>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-luxury-text mb-2 font-medium">
                  {t.form.city} <span className="text-luxury-gold">{t.form.required}</span>
                </label>
                <input
                  type="text"
                  id="city"
                  value={formData.city}
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value })
                    if (errors.city) {
                      setErrors({ ...errors, city: undefined })
                    }
                  }}
                  className="w-full px-4 py-3 bg-luxury-black gold-border text-luxury-text focus:outline-none focus:border-luxury-gold transition-colors"
                  required
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-400">{errors.city}</p>
                )}
              </div>

              <div>
                <label htmlFor="street" className="block text-luxury-text mb-2 font-medium">
                  {t.form.street} <span className="text-luxury-gold">{t.form.required}</span>
                </label>
                <input
                  type="text"
                  id="street"
                  value={formData.street}
                  onChange={(e) => {
                    setFormData({ ...formData, street: e.target.value })
                    if (errors.street) {
                      setErrors({ ...errors, street: undefined })
                    }
                  }}
                  className="w-full px-4 py-3 bg-luxury-black gold-border text-luxury-text focus:outline-none focus:border-luxury-gold transition-colors"
                  required
                />
                {errors.street && (
                  <p className="mt-1 text-sm text-red-400">{errors.street}</p>
                )}
              </div>

              <div>
                <label htmlFor="buildingNumber" className="block text-luxury-text mb-2 font-medium">
                  {t.form.buildingNumber} <span className="text-luxury-gold">{t.form.required}</span>
                </label>
                <input
                  type="text"
                  id="buildingNumber"
                  value={formData.buildingNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, buildingNumber: e.target.value })
                    if (errors.buildingNumber) {
                      setErrors({ ...errors, buildingNumber: undefined })
                    }
                  }}
                  className="w-full px-4 py-3 bg-luxury-black gold-border text-luxury-text focus:outline-none focus:border-luxury-gold transition-colors"
                  required
                />
                {errors.buildingNumber && (
                  <p className="mt-1 text-sm text-red-400">{errors.buildingNumber}</p>
                )}
              </div>

              <div>
                <label htmlFor="apartmentNumber" className="block text-luxury-text mb-2 font-medium">
                  {t.form.apartmentNumber}
                </label>
                <input
                  type="text"
                  id="apartmentNumber"
                  value={formData.apartmentNumber}
                  onChange={(e) => setFormData({ ...formData, apartmentNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-luxury-black gold-border text-luxury-text focus:outline-none focus:border-luxury-gold transition-colors"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-luxury-text mb-2 font-medium">
                  {t.form.phone} <span className="text-luxury-gold">{t.form.required}</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value })
                    if (errors.phone) {
                      setErrors({ ...errors, phone: undefined })
                    }
                  }}
                  className="w-full px-4 py-3 bg-luxury-black gold-border text-luxury-text focus:outline-none focus:border-luxury-gold transition-colors"
                  required
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-luxury-text mb-2 font-medium">
                  {t.form.email} <span className="text-luxury-gold">{t.form.required}</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (errors.email) {
                      setErrors({ ...errors, email: undefined })
                    }
                  }}
                  className="w-full px-4 py-3 bg-luxury-black gold-border text-luxury-text focus:outline-none focus:border-luxury-gold transition-colors"
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
                {formData.email && !errors.email && validateEmail(formData.email) && (
                  <p className="mt-1 text-sm text-luxury-gold">{t.form.emailValid}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-luxury-text mb-2 font-medium">
                  {t.form.notes}
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-luxury-black gold-border text-luxury-text focus:outline-none focus:border-luxury-gold transition-colors resize-none"
                />
              </div>
            </div>

            {/* Captcha */}
            <div className="md:col-span-2">
              <Captcha ref={captchaRef} locale={locale} sessionId={sessionId} />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="gold-button disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t.form.submitting : t.form.submit}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
