// In-memory captcha code storage
// In production, use Redis or similar for distributed systems

import { checkRateLimit, recordFailedAttempt, resetRateLimit } from './rateLimit'

interface CaptchaEntry {
  code: string
  expiresAt: number
  verifiedAt?: number // Timestamp when verified (one-time use)
  used?: boolean // Flag to prevent replay attacks
}

const captchaStore = new Map<string, CaptchaEntry>()

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [id, data] of captchaStore.entries()) {
    if (now > data.expiresAt) {
      captchaStore.delete(id)
    }
  }
}, 30000) // Clean up every 30 seconds

/**
 * Generate and store a new captcha code
 * @param sessionId - Unique session identifier
 * @returns Generated captcha code and expiration time
 */
export function generateCaptcha(sessionId: string): { code: string; expiresAt: number } {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  const expiresAt = Date.now() + 60000 // 1 minute
  captchaStore.set(sessionId, { code, expiresAt })

  return { code, expiresAt }
}

/**
 * Verify a captcha code
 * @param sessionId - Session identifier
 * @param userCode - Code entered by user (will be trimmed and normalized)
 * @param ip - Client IP address
 * @param markAsUsed - Whether to mark as used (for server-side final verification)
 * @returns Verification result
 */
export async function verifyCaptcha(
  sessionId: string,
  userCode: string,
  ip: string,
  markAsUsed: boolean = false
): Promise<{ success: boolean; error?: string; blocked?: boolean; remainingTime?: number }> {
  // Normalize user input: trim whitespace and convert to uppercase
  const normalizedUserCode = userCode.trim().toUpperCase()

  // Check rate limiting
  const rateLimitCheck = checkRateLimit(ip)
  if (rateLimitCheck.isBlocked) {
    const remainingSeconds = Math.ceil((rateLimitCheck.remainingTime || 0) / 1000)
    return {
      success: false,
      error: 'Too many attempts. Please try again later.',
      blocked: true,
      remainingTime: remainingSeconds,
    }
  }

  // Get stored captcha
  const stored = captchaStore.get(sessionId)

  if (!stored) {
    const failed = recordFailedAttempt(ip)
    return {
      success: false,
      error: 'Captcha expired or invalid',
      blocked: failed.isBlocked,
      remainingTime: failed.remainingTime ? Math.ceil(failed.remainingTime / 1000) : undefined,
    }
  }

  // Check if already used (prevent replay attacks)
  if (stored.used) {
    const failed = recordFailedAttempt(ip)
    return {
      success: false,
      error: 'Captcha has already been used',
      blocked: failed.isBlocked,
      remainingTime: failed.remainingTime ? Math.ceil(failed.remainingTime / 1000) : undefined,
    }
  }

  // Check expiration
  const now = Date.now()
  if (now > stored.expiresAt) {
    captchaStore.delete(sessionId)
    const failed = recordFailedAttempt(ip)
    return {
      success: false,
      error: 'Captcha expired',
      blocked: failed.isBlocked,
      remainingTime: failed.remainingTime ? Math.ceil(failed.remainingTime / 1000) : undefined,
    }
  }

  // If already verified (client-side), check if within valid window (30 seconds)
  if (stored.verifiedAt) {
    const timeSinceVerification = now - stored.verifiedAt
    if (timeSinceVerification > 30000) {
      // Verification expired (older than 30 seconds)
      captchaStore.delete(sessionId)
      const failed = recordFailedAttempt(ip)
      return {
        success: false,
        error: 'Captcha verification expired',
        blocked: failed.isBlocked,
        remainingTime: failed.remainingTime ? Math.ceil(failed.remainingTime / 1000) : undefined,
      }
    }
    // Already verified within time window
    if (markAsUsed) {
      // Server-side final check - mark as used
      resetRateLimit(ip)
      stored.used = true
      // Delete after a short delay to allow final checks
      setTimeout(() => captchaStore.delete(sessionId), 5000)
      return { success: true }
    }
    // Client-side re-verification - return success without marking as used
    return { success: true }
  }

  // Not yet verified - require code match (only if code is provided)
  if (normalizedUserCode) {
    const normalizedStoredCode = stored.code.toUpperCase()
    if (normalizedUserCode !== normalizedStoredCode) {
      const failed = recordFailedAttempt(ip)
      return {
        success: false,
        error: 'Invalid captcha code',
        blocked: failed.isBlocked,
        remainingTime: failed.remainingTime ? Math.ceil(failed.remainingTime / 1000) : undefined,
      }
    }
  } else if (markAsUsed) {
    // Server-side check without code - captcha must already be verified
    const failed = recordFailedAttempt(ip)
    return {
      success: false,
      error: 'Captcha not verified',
      blocked: failed.isBlocked,
      remainingTime: failed.remainingTime ? Math.ceil(failed.remainingTime / 1000) : undefined,
    }
  } else {
    // Client-side check without code - invalid
    const failed = recordFailedAttempt(ip)
    return {
      success: false,
      error: 'Captcha code required',
      blocked: failed.isBlocked,
      remainingTime: failed.remainingTime ? Math.ceil(failed.remainingTime / 1000) : undefined,
    }
  }

  // Success - reset rate limit and mark as verified (not deleted yet)
  resetRateLimit(ip)
  stored.verifiedAt = now
  
  // If markAsUsed is true, mark as used and schedule deletion
  if (markAsUsed) {
    stored.used = true
    setTimeout(() => captchaStore.delete(sessionId), 5000)
  }

  return { success: true }
}
