'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from '@/lib/i18n'
import { getCartelaName } from '@/lib/cartelaNames'

interface CollectionSelection {
  collection: string
  cartelas: number[]
}

interface SubmissionDetail {
  id: string
  companyName: string
  nip: string
  country?: string | null
  postalCode?: string | null
  city?: string | null
  street?: string | null
  buildingNumber?: string | null
  apartmentNumber?: string | null
  phone: string
  email: string
  notes: string | null
  collections: string // JSON string of collection selections
  createdAt: string
  // Legacy support
  deliveryAddress?: string | null
}

export default function SubmissionDetail() {
  const t = getTranslations('pl') // Admin panel is always Polish
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check')
      if (response.ok) {
        setIsAuthenticated(true)
        fetchSubmission()
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/submissions?id=${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setSubmission(data)
      } else {
        alert('Zgłoszenie nie zostało znalezione')
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error fetching submission:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      const response = await fetch(`/api/admin/export-single?id=${params.id}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `submission-${submission?.companyName}-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Błąd podczas eksportowania PDF')
    }
  }

  if (!isAuthenticated || isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-luxury-text">Ładowanie...</div>
      </main>
    )
  }

  if (!submission) {
    return null
  }

  // Parse collections data
  let collectionsData: CollectionSelection[] = []

  if (submission.collections) {
    try {
      const parsed = JSON.parse(submission.collections)
      // Handle both array format and legacy number array format
      if (Array.isArray(parsed)) {
        if (parsed.length > 0 && typeof parsed[0] === 'number') {
          // Legacy format: array of numbers
          collectionsData = [{
            collection: 'Legacy',
            cartelas: parsed.sort((a: number, b: number) => a - b),
          }]
        } else {
          // New format: array of collection objects
          collectionsData = parsed as CollectionSelection[]
        }
      }
    } catch (e) {
      console.error('Error parsing collections:', e)
    }
  }

  // Check if this is a legacy submission (has deliveryAddress but not separate fields)
  const isLegacy = submission.deliveryAddress && !submission.country

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#010101]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-luxury-gold hover:text-luxury-gold-light transition-colors"
          >
            {t.admin.details.back}
          </Link>
        </div>

        <div className="gold-border p-6 sm:p-8">
          <div className="mb-6 flex justify-between items-start">
            <h1 className="text-3xl font-luxury-heading text-luxury-text">
              {t.admin.details.title}
            </h1>
            <button
              onClick={handleExportPDF}
              className="gold-button"
            >
              {t.admin.details.exportPdf}
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-luxury-gold text-sm font-medium mb-1">
                {t.admin.details.companyName}
              </label>
              <p className="text-luxury-text text-lg">{submission.companyName}</p>
            </div>

            <div>
              <label className="block text-luxury-gold text-sm font-medium mb-1">
                {t.admin.details.nip}
              </label>
              <p className="text-luxury-text text-lg">{submission.nip}</p>
            </div>

            {/* Address Section */}
            {isLegacy ? (
              <div>
                <label className="block text-luxury-gold text-sm font-medium mb-1">
                  {t.admin.details.deliveryAddress}
                </label>
                <p className="text-luxury-text text-lg">{submission.deliveryAddress}</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-luxury-gold text-sm font-medium mb-1">
                    {t.admin.details.deliveryAddress}
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                  <div>
                    <label className="block text-luxury-gold text-xs font-medium mb-1">
                      {t.admin.details.country}
                    </label>
                    <p className="text-luxury-text">{submission.country || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-luxury-gold text-xs font-medium mb-1">
                      {t.admin.details.postalCode}
                    </label>
                    <p className="text-luxury-text">{submission.postalCode || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-luxury-gold text-xs font-medium mb-1">
                      {t.admin.details.city}
                    </label>
                    <p className="text-luxury-text">{submission.city || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-luxury-gold text-xs font-medium mb-1">
                      {t.admin.details.street}
                    </label>
                    <p className="text-luxury-text">{submission.street || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-luxury-gold text-xs font-medium mb-1">
                      {t.admin.details.buildingNumber}
                    </label>
                    <p className="text-luxury-text">{submission.buildingNumber || '-'}</p>
                  </div>
                  {submission.apartmentNumber && (
                    <div>
                      <label className="block text-luxury-gold text-xs font-medium mb-1">
                        {t.admin.details.apartmentNumber}
                      </label>
                      <p className="text-luxury-text">{submission.apartmentNumber}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-luxury-gold text-sm font-medium mb-1">
                {t.admin.details.phone}
              </label>
              <p className="text-luxury-text text-lg">{submission.phone}</p>
            </div>

            <div>
              <label className="block text-luxury-gold text-sm font-medium mb-1">
                {t.admin.details.email}
              </label>
              <p className="text-luxury-text text-lg">{submission.email}</p>
            </div>

            {submission.notes && (
              <div>
                <label className="block text-luxury-gold text-sm font-medium mb-1">
                  {t.admin.details.notes}
                </label>
                <p className="text-luxury-text text-lg whitespace-pre-wrap">{submission.notes}</p>
              </div>
            )}

            {/* Collection-based selections */}
            <div>
              <label className="block text-luxury-gold text-sm font-medium mb-2">
                Wybrane Kolekcje i Próbki
              </label>
              {collectionsData.length > 0 ? (
                <div className="space-y-4">
                  {collectionsData.map((collectionData, index) => (
                    <div key={index} className="gold-border p-4 bg-luxury-gold/5">
                      <h4 className="text-luxury-gold font-bold mb-3 text-base">
                        {collectionData.collection}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {collectionData.cartelas.sort((a, b) => a - b).map((cartelaNumber) => {
                          const cartelaName = getCartelaName(collectionData.collection, cartelaNumber)
                          return (
                            <span
                              key={cartelaNumber}
                              className="px-3 py-1 gold-border bg-luxury-gold/10 text-luxury-gold"
                              title={`#${cartelaNumber}`}
                            >
                              {cartelaName}
                            </span>
                          )
                        })}
                      </div>
                      <p className="mt-2 text-luxury-text-secondary text-sm">
                        {collectionData.cartelas.length} {collectionData.cartelas.length === 1 ? 'próbka' : 'próbki'}
                      </p>
                    </div>
                  ))}
                  <p className="mt-4 text-luxury-text-secondary text-sm">
                    {t.admin.details.total}: {collectionsData.reduce((sum, c) => sum + c.cartelas.length, 0)} próbek z {collectionsData.length} {collectionsData.length === 1 ? 'kolekcji' : 'kolekcji'}
                  </p>
                </div>
              ) : (
                <p className="text-luxury-text-secondary">Brak wybranych próbek</p>
              )}
            </div>

            <div>
              <label className="block text-luxury-gold text-sm font-medium mb-1">
                {t.admin.details.submissionDate}
              </label>
              <p className="text-luxury-text text-lg">
                {new Date(submission.createdAt).toLocaleString('pl-PL')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
