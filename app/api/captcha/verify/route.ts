import { NextRequest, NextResponse } from 'next/server'
import { getClientIP } from '@/lib/rateLimit'
import { generateCaptcha, verifyCaptcha } from '@/lib/captchaStore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { captchaCode, sessionId, markAsUsed } = body

    if (!captchaCode || !sessionId) {
      return NextResponse.json(
        { error: 'Missing captcha code or session ID' },
        { status: 400 }
      )
    }

    const ip = getClientIP(request)
    // markAsUsed defaults to false for client-side verification, true for server-side final check
    const result = await verifyCaptcha(sessionId, captchaCode, ip, markAsUsed === true)

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error,
          blocked: result.blocked,
          remainingTime: result.remainingTime,
        },
        { status: result.blocked ? 429 : 400 }
      )
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Captcha verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      )
    }

    // Generate new captcha code
    const { code, expiresAt } = generateCaptcha(sessionId)

    return NextResponse.json(
      { code, expiresAt },
      { status: 200 }
    )
  } catch (error) {
    console.error('Captcha generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
