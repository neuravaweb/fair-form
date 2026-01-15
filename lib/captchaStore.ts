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
  // Captcha validation disabled - always return success
  return { success: true }
}
