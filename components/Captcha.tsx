'use client'

import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'

interface CaptchaProps {
  onError?: (error: string) => void
  locale?: 'pl' | 'en'
  sessionId: string
}

export interface CaptchaRef {
  verify: () => Promise<boolean>
  refresh: () => void
}

const Captcha = forwardRef<CaptchaRef, CaptchaProps>(({ onError, locale = 'pl', sessionId }, ref) => {
  const [captchaCode, setCaptchaCode] = useState('')
  const [userInput, setUserInput] = useState('')
  const [error, setError] = useState('')
  const [isExpired, setIsExpired] = useState(false)
  const [expiresAt, setExpiresAt] = useState<number | null>(null)

  const generateCode = useCallback(async () => {
    try {
      const response = await fetch(`/api/captcha/verify?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setCaptchaCode(data.code)
        setUserInput('')
        setError('')
        setIsExpired(false)
        setExpiresAt(data.expiresAt)
        
        // Store in sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`captcha_code_${sessionId}`, data.code)
          sessionStorage.setItem(`captcha_expires_${sessionId}`, data.expiresAt.toString())
        }
      }
    } catch (err) {
      console.error('Failed to generate captcha:', err)
      // Fallback: generate client-side
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let code = ''
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      setCaptchaCode(code)
      const expirationTime = Date.now() + 60000
      setExpiresAt(expirationTime)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(`captcha_code_${sessionId}`, code)
        sessionStorage.setItem(`captcha_expires_${sessionId}`, expirationTime.toString())
      }
    }
  }, [sessionId])

  useEffect(() => {
    generateCode()
  }, [generateCode])

  // Check expiration every second
  useEffect(() => {
    if (!expiresAt) return

    const interval = setInterval(() => {
      if (Date.now() >= expiresAt) {
        setIsExpired(true)
        const errorMsg = locale === 'pl' ? 'Kod wygasł. Wygeneruj nowy.' : 'Code expired. Generate a new one.'
        setError(errorMsg)
        if (onError) onError(errorMsg)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, locale, onError])

  const handleRefresh = () => {
    generateCode()
  }

  const verify = useCallback(async (): Promise<boolean> => {
    // Normalize input: trim whitespace
    const normalizedInput = userInput.trim()

    if (isExpired) {
      const errorMsg = locale === 'pl' ? 'Kod wygasł. Wygeneruj nowy.' : 'Code expired. Generate a new one.'
      setError(errorMsg)
      if (onError) onError(errorMsg)
      return false
    }

    if (!normalizedInput) {
      const errorMsg = locale === 'pl' ? 'Wprowadź kod' : 'Enter the code'
      setError(errorMsg)
      if (onError) onError(errorMsg)
      return false
    }

    // Verify with backend (client-side verification - doesn't mark as used yet)
    try {
      const response = await fetch('/api/captcha/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          captchaCode: normalizedInput, // Send trimmed, normalized input
          sessionId,
          markAsUsed: false, // Client-side verification - don't mark as used yet
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setError('')
        return true
      } else {
        const errorMsg = data.error || (locale === 'pl' ? 'Nieprawidłowy kod' : 'Invalid code')
        setError(errorMsg)
        if (onError) onError(errorMsg)
        
        // If blocked, show remaining time
        if (data.blocked && data.remainingTime) {
          const blockedMsg = locale === 'pl' 
            ? `Zbyt wiele prób. Spróbuj ponownie za ${data.remainingTime} sekund.`
            : `Too many attempts. Try again in ${data.remainingTime} seconds.`
          setError(blockedMsg)
          if (onError) onError(blockedMsg)
        } else {
          // Generate new code on wrong attempt
          generateCode()
        }
        return false
      }
    } catch (err) {
      const errorMsg = locale === 'pl' ? 'Błąd weryfikacji' : 'Verification error'
      setError(errorMsg)
      if (onError) onError(errorMsg)
      return false
    }
  }, [userInput, isExpired, sessionId, locale, onError, generateCode])

  useImperativeHandle(ref, () => ({
    verify,
    refresh: handleRefresh,
  }))

  const translations = {
    pl: {
      label: 'Kod weryfikacyjny',
      placeholder: 'Wprowadź kod',
      refresh: 'Odśwież',
    },
    en: {
      label: 'Verification Code',
      placeholder: 'Enter code',
      refresh: 'Refresh',
    },
  }

  const t = translations[locale] || translations.pl // Fallback to Polish if locale is invalid

  return (
    <div className="space-y-3">
      <label className="block text-luxury-text mb-2 font-medium">
        {t.label} <span className="text-luxury-gold">*</span>
      </label>
      
      <div className="flex items-center gap-3">
        {/* Captcha Display Box */}
        <div className="relative">
          <div className="px-4 py-3 bg-luxury-black gold-border font-mono text-2xl font-bold text-luxury-gold tracking-wider select-none">
            {captchaCode}
          </div>
          {isExpired && (
            <div className="absolute inset-0 bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
              <span className="text-red-400 text-xs font-bold">EXPIRED</span>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <button
          type="button"
          onClick={handleRefresh}
          className="px-3 py-2 gold-border bg-luxury-gold/10 text-luxury-gold hover:bg-luxury-gold/20 transition-colors"
          title={t.refresh}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={userInput}
        onChange={(e) => {
          setUserInput(e.target.value.toUpperCase())
          setError('')
        }}
        placeholder={t.placeholder}
        maxLength={6}
        className={`w-full px-4 py-3 bg-luxury-black gold-border text-luxury-text focus:outline-none focus:border-luxury-gold transition-colors uppercase ${
          error ? 'border-red-500' : ''
        }`}
        disabled={isExpired}
      />

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {isExpired && (
        <p className="text-sm text-luxury-gold">
          {locale === 'pl' 
            ? 'Kod wygasł po 1 minucie. Kliknij przycisk odświeżania, aby wygenerować nowy kod.'
            : 'Code expired after 1 minute. Click the refresh button to generate a new code.'
          }
        </p>
      )}
    </div>
  )
})

Captcha.displayName = 'Captcha'

export default Captcha
