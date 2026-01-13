import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsPDF } from 'jspdf'
import { getCartelaName } from '@/lib/cartelaNames'

interface CollectionSelection {
  collection: string
  cartelas: number[]
}

export async function GET(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('admin-auth')
    
    if (!authCookie || authCookie.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Submission ID required' }, { status: 400 })
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
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

    // Create PDF
    const doc = new jsPDF()
    
    // Set white background
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, 210, 297, 'F')
    
    // Set font
    doc.setFont('helvetica', 'normal')
    
    // Title (Gold - keep as is)
    doc.setFontSize(20)
    doc.setTextColor(201, 162, 77) // Gold color
    doc.setFont('helvetica', 'bold')
    doc.text('Fabric Fair - Szczegoly Zgloszenia', 20, 20)
    
    // Line (Gold)
    doc.setDrawColor(201, 162, 77)
    doc.line(20, 25, 190, 25)
    
    let yPos = 35
    
    // Company Information (Black text)
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0) // Black
    doc.setFont('helvetica', 'bold')
    doc.text('Informacje o Firmie', 20, yPos)
    yPos += 10
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0) // Black
    
    doc.text(`Nazwa Firmy: ${submission.companyName}`, 20, yPos)
    yPos += 7
    
    doc.text(`NIP: ${submission.nip}`, 20, yPos)
    yPos += 7
    
    doc.text(`E-mail: ${submission.email}`, 20, yPos)
    yPos += 7
    
    doc.text(`Nr. Telefonu: ${submission.phone}`, 20, yPos)
    yPos += 7
    
    // Address fields
    if (submission.country && submission.postalCode && submission.city && submission.street && submission.buildingNumber) {
      let addressParts = [
        submission.country,
        submission.postalCode,
        submission.city,
        submission.street,
        submission.buildingNumber
      ]
      if (submission.apartmentNumber) {
        addressParts.push(submission.apartmentNumber)
      }
      doc.text(`Adres Dostawy: ${addressParts.join(', ')}`, 20, yPos)
    } else if (submission.deliveryAddress) {
      // Legacy format
      doc.text(`Adres Dostawy: ${submission.deliveryAddress}`, 20, yPos)
    }
    yPos += 7
    
    if (submission.notes) {
      doc.text(`Notatka: ${submission.notes}`, 20, yPos)
      yPos += 7
    }
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage()
      doc.setFillColor(255, 255, 255)
      doc.rect(0, 0, 210, 297, 'F')
      yPos = 20
    }
    
    // Collections and Cartelas (Black text)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0) // Black
    doc.text('Wybrane Kolekcje i Probki', 20, yPos)
    yPos += 10
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0) // Black
    
    collectionsData.forEach((collectionData, index) => {
      // Check if we need a new page
      if (yPos > 270) {
        doc.addPage()
        doc.setFillColor(255, 255, 255)
        doc.rect(0, 0, 210, 297, 'F')
        yPos = 20
      }
      
      // Collection name (Gold - keep as is)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(201, 162, 77) // Gold
      doc.text(`${collectionData.collection}:`, 20, yPos)
      yPos += 7
      
      // Cartelas with checkboxes (Black text)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0) // Black
      
      // Draw each cartela with a checkbox
      const checkboxSize = 3 // Size of checkbox in mm
      const checkboxX = 20
      const textX = checkboxX + checkboxSize + 2 // Text starts after checkbox + spacing
      const maxWidth = 170 // Maximum width for text
      
      for (let i = 0; i < collectionData.cartelas.length; i++) {
        const cartelaNumber = collectionData.cartelas[i]
        const cartelaName = getCartelaName(collectionData.collection, cartelaNumber)
        
        // Check if we need a new page
        if (yPos > 280) {
          doc.addPage()
          doc.setFillColor(255, 255, 255)
          doc.rect(0, 0, 210, 297, 'F')
          yPos = 20
        }
        
        // Draw checkbox (empty square)
        doc.setDrawColor(0, 0, 0) // Black border
        doc.setLineWidth(0.3)
        doc.rect(checkboxX, yPos - checkboxSize / 2, checkboxSize, checkboxSize)
        
        // Draw cartela name
        doc.text(cartelaName, textX, yPos)
        
        yPos += 5 // Spacing between items
      }
      
      // Collection total
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100) // Gray for secondary text
      const probkaText = collectionData.cartelas.length === 1 ? 'probka' : 'probki'
      doc.text(`Lacznie: ${collectionData.cartelas.length} ${probkaText}`, 20, yPos)
      yPos += 7
    })
    
    // Overall total
    const totalCartelas = collectionsData.reduce((sum, c) => sum + c.cartelas.length, 0)
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0) // Black
    const totalProbkaText = totalCartelas === 1 ? 'probka' : 'probek'
    const kolekcjaText = collectionsData.length === 1 ? 'kolekcji' : 'kolekcji'
    doc.text(`Lacznie: ${totalCartelas} ${totalProbkaText} z ${collectionsData.length} ${kolekcjaText}`, 20, yPos)
    yPos += 7
    
    // Submission Date (Black text)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0) // Black
    doc.text('Data Zgloszenia:', 20, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(new Date(submission.createdAt).toLocaleString('pl-PL'), 70, yPos)
    
    // Generate PDF buffer
    const pdfOutput = doc.output('arraybuffer')
    const pdfBuffer = Buffer.from(pdfOutput)
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="submission-${submission.companyName}-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
