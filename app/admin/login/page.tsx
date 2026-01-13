'use client'

import { useState, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getTranslations } from '@/lib/i18n'
import Captcha, { type CaptchaRef } from '@/components/Captcha'

export default function AdminLogin() {
  const t = getTranslations('pl') // Admin panel is always Polish
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const captchaRef = useRef<CaptchaRef>(null)
  const [sessionId] = useState(() => `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // Verify captcha first
    if (captchaRef.current) {
      const captchaValid = await captchaRef.current.verify()
      if (!captchaValid) {
        return
      }
    }

    setIsLoading(true)

    try {
      // Pass sessionId - server will check if captcha was verified client-side
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username,
          password,
          sessionId, // Server will verify the already-verified captcha
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError(data.error || t.admin.login.error)
        if (data.blocked && data.remainingTime) {
          setError(`Zbyt wiele prób. Spróbuj ponownie za ${data.remainingTime} sekund.`)
        }
        // Refresh captcha on error
        if (captchaRef.current) {
          captchaRef.current.refresh()
        }
      }
    } catch (error) {
      setError('Wystąpił błąd. Spróbuj ponownie.')
      if (captchaRef.current) {
        captchaRef.current.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#010101]">
      <div className="w-full max-w-md">
        <div className="gold-border p-8 sm:p-12">
          <h1 className="text-3xl font-luxury-heading text-luxury-text mb-8 text-center">
            {t.admin.login.title}
          </h1>
          
          {error && (
            <div className="mb-6 p-4 border border-red-400/50 bg-red-400/10 text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-luxury-text mb-2 font-medium">
                {t.admin.login.username}
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-luxury-black gold-border text-luxury-text focus:outline-none focus:border-luxury-gold transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-luxury-text mb-2 font-medium">
                {t.admin.login.password}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-luxury-black gold-border text-luxury-text focus:outline-none focus:border-luxury-gold transition-colors"
                required
              />
            </div>

            {/* Captcha */}
            <Captcha ref={captchaRef} locale="pl" sessionId={sessionId} />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full gold-button disabled:opacity-50"
            >
              {isLoading ? t.admin.login.loggingIn : t.admin.login.login}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
