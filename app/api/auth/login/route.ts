import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { checkRateLimit, recordFailedAttempt, resetRateLimit, getClientIP } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const { email, password, sessionId } = await request.json()
    const ip = getClientIP(request)

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Check rate limiting
    const rateLimitCheck = checkRateLimit(ip)
    if (rateLimitCheck.isBlocked) {
      const remainingSeconds = Math.ceil((rateLimitCheck.remainingTime || 0) / 1000)
      return NextResponse.json(
        { 
          error: `Zbyt wiele prób. Spróbuj ponownie za ${remainingSeconds} sekund.`,
          blocked: true,
          remainingTime: remainingSeconds,
        },
        { status: 429 }
      )
    }

    // Verify captcha if sessionId provided (server-side final check - marks as used)
    // The captcha should have been verified client-side first
    if (sessionId) {
      const { verifyCaptcha } = await import('@/lib/captchaStore')
      // For server-side, we check if captcha was already verified (client-side)
      // markAsUsed = true to mark captcha as used after successful server-side verification
      // Pass empty code since we're only checking if it was already verified
      const captchaResult = await verifyCaptcha(sessionId, '', ip, true)
      
      if (!captchaResult.success) {
        return NextResponse.json(
          { 
            error: captchaResult.error || 'Wymagana weryfikacja captcha. Zweryfikuj kod captcha przed zalogowaniem.',
            blocked: captchaResult.blocked,
            remainingTime: captchaResult.remainingTime,
          },
          { status: captchaResult.blocked ? 429 : 400 }
        )
      }
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    })

    if (!admin) {
      recordFailedAttempt(ip)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, admin.password)

    if (!isValidPassword) {
      recordFailedAttempt(ip)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Success - reset rate limit
    resetRateLimit(ip)

    // In production, use proper session management or JWT
    // For now, we'll use a simple approach with httpOnly cookies
    const response = NextResponse.json({ success: true })
    
    // Set a simple session token (in production, use proper session management)
    response.cookies.set('admin-auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
