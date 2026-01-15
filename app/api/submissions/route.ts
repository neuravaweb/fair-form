import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { checkRateLimit, getClientIP } from '@/lib/rateLimit'

const collectionSelectionSchema = z.object({
  collection: z.enum(['Sinope', 'Premier Home', 'Decency', 'Magia']),
  cartelas: z.array(z.number()).min(1, 'At least one cartela must be selected per collection'),
})

const submissionSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  nip: z.string().regex(/^\d{10}$/, 'NIP must be exactly 10 digits'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  city: z.string().min(1, 'City is required'),
  street: z.string().min(1, 'Street is required'),
  buildingNumber: z.string().min(1, 'Building number is required'),
  apartmentNumber: z.string().optional(),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  notes: z.string().optional(),
  collections: z.array(collectionSelectionSchema).min(1, 'At least one collection with cartelas must be selected'),
  captchaCode: z.string().optional(),
  sessionId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const ip = getClientIP(request)
    
    // Check rate limiting
    const rateLimitCheck = checkRateLimit(ip)
    if (rateLimitCheck.isBlocked) {
      const remainingSeconds = Math.ceil((rateLimitCheck.remainingTime || 0) / 1000)
      return NextResponse.json(
        { 
          error: 'Too many attempts. Please try again later.',
          blocked: true,
          remainingTime: remainingSeconds,
        },
        { status: 429 }
      )
    }
    
    const validation = submissionSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    // Captcha validation disabled - no longer required

    // Validate collections structure
    if (!validation.data.collections || validation.data.collections.length === 0) {
      return NextResponse.json(
        { error: 'At least one collection with cartelas must be selected' },
        { status: 400 }
      )
    }

    // Validate each collection has at least one cartela
    for (const collection of validation.data.collections) {
      if (!collection.cartelas || collection.cartelas.length === 0) {
        return NextResponse.json(
          { error: `Collection ${collection.collection} must have at least one cartela selected` },
          { status: 400 }
        )
      }
    }

    // Store collections as JSON string (database stores as String type)
    const submission = await prisma.submission.create({
      data: {
        companyName: validation.data.companyName,
        nip: validation.data.nip,
        country: validation.data.country,
        postalCode: validation.data.postalCode,
        city: validation.data.city,
        street: validation.data.street,
        buildingNumber: validation.data.buildingNumber,
        apartmentNumber: validation.data.apartmentNumber || null,
        phone: validation.data.phone,
        email: validation.data.email,
        notes: validation.data.notes || null,
        collections: JSON.stringify(validation.data.collections),
      },
    })

    return NextResponse.json(
      { success: true, id: submission.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const submission = await prisma.submission.findUnique({
        where: { id },
      })

      if (!submission) {
        return NextResponse.json(
          { error: 'Submission not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(submission)
    }

    const submissions = await prisma.submission.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyName: true,
        nip: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}
