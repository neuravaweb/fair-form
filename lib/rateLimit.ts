// In-memory rate limiting for captcha attempts
// Stores IP-based attempt tracking

interface RateLimitEntry {
  attempts: number
  blockedUntil: number | null
  lastAttempt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

const MAX_ATTEMPTS = 5
const BLOCK_DURATION = 30000 // 30 seconds in milliseconds
const CLEANUP_INTERVAL = 60000 // Clean up old entries every minute

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitStore.entries()) {
    // Remove entries that are no longer blocked and older than 5 minutes
    if (!entry.blockedUntil && now - entry.lastAttempt > 300000) {
      rateLimitStore.delete(ip)
    } else if (entry.blockedUntil && now > entry.blockedUntil && now - entry.lastAttempt > 300000) {
      rateLimitStore.delete(ip)
    }
  }
}, CLEANUP_INTERVAL)

/**
 * Check if an IP is rate limited
 * @param ip - IP address
 * @returns Object with isBlocked flag and remaining time if blocked
 */
export function checkRateLimit(ip: string): { isBlocked: boolean; remainingTime?: number } {
  const entry = rateLimitStore.get(ip)
  
  if (!entry) {
    return { isBlocked: false }
  }

  // Check if currently blocked
  if (entry.blockedUntil && Date.now() < entry.blockedUntil) {
    return {
      isBlocked: true,
      remainingTime: entry.blockedUntil - Date.now(),
    }
  }

  // If block expired, reset
  if (entry.blockedUntil && Date.now() >= entry.blockedUntil) {
    rateLimitStore.delete(ip)
    return { isBlocked: false }
  }

  return { isBlocked: false }
}

/**
 * Record a failed attempt
 * @param ip - IP address
 * @returns Object with isBlocked flag and attempt count
 */
export function recordFailedAttempt(ip: string): { isBlocked: boolean; attempts: number; remainingTime?: number } {
  const entry = rateLimitStore.get(ip) || {
    attempts: 0,
    blockedUntil: null,
    lastAttempt: Date.now(),
  }

  entry.attempts += 1
  entry.lastAttempt = Date.now()

  // Block if max attempts reached
  if (entry.attempts >= MAX_ATTEMPTS) {
    entry.blockedUntil = Date.now() + BLOCK_DURATION
    rateLimitStore.set(ip, entry)
    return {
      isBlocked: true,
      attempts: entry.attempts,
      remainingTime: BLOCK_DURATION,
    }
  }

  rateLimitStore.set(ip, entry)
  return {
    isBlocked: false,
    attempts: entry.attempts,
  }
}

/**
 * Reset rate limit for an IP (on successful verification)
 * @param ip - IP address
 */
export function resetRateLimit(ip: string): void {
  rateLimitStore.delete(ip)
}

/**
 * Get client IP from request
 * @param request - NextRequest object
 * @returns IP address string
 */
export function getClientIP(request: Request): string {
  // Try various headers for IP
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  
  // Fallback (for development)
  return 'unknown'
}
