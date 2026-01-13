'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from '@/lib/i18n'

interface Submission {
  id: string
  companyName: string
  nip: string
  email: string
  phone: string
  createdAt: string
}

export default function AdminDashboard() {
  const t = getTranslations('pl') // Admin panel is always Polish
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check')
      if (response.ok) {
        setIsAuthenticated(true)
        fetchSubmissions()
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      router.push('/admin/login')
    }
  }

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions')
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      }
    } catch (error) {
      console.error('Error fetching submissions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const handleExportAll = async () => {
    try {
      const response = await fetch('/api/admin/export-all')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `all-submissions-${new Date().toISOString().split('T')[0]}.pdf`
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

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#010101]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-luxury-heading text-luxury-text mb-2">
              {t.admin.dashboard.title}
            </h1>
            <p className="text-luxury-text-secondary">
              {submissions.length} {submissions.length === 1 ? t.admin.dashboard.submission : t.admin.dashboard.submissions} {t.admin.dashboard.submissionsTotal}
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleExportAll}
              className="gold-button"
            >
              {t.admin.dashboard.exportAll}
            </button>
            <button
              onClick={handleLogout}
              className="gold-button"
            >
              {t.admin.dashboard.logout}
            </button>
          </div>
        </div>

        <div className="gold-border overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-luxury-gold/40">
                <th className="px-4 py-4 text-left text-luxury-gold font-medium">{t.admin.dashboard.companyName}</th>
                <th className="px-4 py-4 text-left text-luxury-gold font-medium">{t.admin.dashboard.nip}</th>
                <th className="px-4 py-4 text-left text-luxury-gold font-medium">{t.admin.dashboard.email}</th>
                <th className="px-4 py-4 text-left text-luxury-gold font-medium">{t.admin.dashboard.phone}</th>
                <th className="px-4 py-4 text-left text-luxury-gold font-medium">{t.admin.dashboard.date}</th>
                <th className="px-4 py-4 text-left text-luxury-gold font-medium">{t.admin.dashboard.actions}</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-luxury-text-secondary">
                    {t.admin.dashboard.noSubmissions}
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="border-b border-luxury-gold/10 hover:bg-luxury-gold/5 transition-colors"
                  >
                    <td className="px-4 py-4 text-luxury-text">{submission.companyName}</td>
                    <td className="px-4 py-4 text-luxury-text-secondary">{submission.nip}</td>
                    <td className="px-4 py-4 text-luxury-text-secondary">{submission.email}</td>
                    <td className="px-4 py-4 text-luxury-text-secondary">{submission.phone}</td>
                    <td className="px-4 py-4 text-luxury-text-secondary">
                      {new Date(submission.createdAt).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/submissions/${submission.id}`}
                        className="text-luxury-gold hover:text-luxury-gold-light transition-colors"
                      >
                        {t.admin.dashboard.viewDetails}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
