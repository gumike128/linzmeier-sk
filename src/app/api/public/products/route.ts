import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/public/products - Public, no auth required
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    const products = await db.product.findMany({
      where: {
        status: 'PUBLISHED',
        ...(category ? { category } : {}),
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('[PUBLIC PRODUCTS API] Error:', error)
    return NextResponse.json(
      { error: 'Nepodarilo sa načítať produkty.' },
      { status: 500 }
    )
  }
}
