import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/public/documents - Public, no auth required
export async function GET() {
  try {
    const documents = await db.document.findMany({
      where: { isPublic: true },
      orderBy: { sortOrder: 'asc' },
    })

    const grouped = documents.reduce(
      (acc, doc) => {
        const cat = doc.category
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(doc)
        return acc
      },
      {} as Record<string, typeof documents[number][]>
    )

    return NextResponse.json({ documents: grouped })
  } catch (error) {
    console.error('[PUBLIC DOCUMENTS API] Error:', error)
    return NextResponse.json(
      { error: 'Nepodarilo sa načítať dokumenty.' },
      { status: 500 }
    )
  }
}
