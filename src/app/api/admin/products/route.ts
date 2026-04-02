import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(1, 'Názov produktu je povinný').max(200, 'Názov je príliš dlhý'),
  slug: z.string().max(200, 'Slug je príliš dlhý').optional(),
  shortDesc: z.string().max(500, 'Krátky popis je príliš dlhý').optional(),
  description: z.string().optional(),
  category: z.string().min(1, 'Kategória je povinná'),
  specs: z.string().optional(),
  benefits: z.string().optional(),
  metaTitle: z.string().max(70, 'Meta title je príliš dlhý').optional(),
  metaDescription: z.string().max(160, 'Meta description je príliš dlhý').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  sortOrder: z.number().int().default(0),
  imageUrl: z.string().url('Neplatná URL adresa obrázka').optional().or(z.literal('')),
  galleryImages: z.string().optional(),
  suitableFor: z.string().optional(),
})

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'products:view')) return forbidden()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (status) where.status = status
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDesc: { contains: search } },
      ]
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Chyba pri načítavaní produktov:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítavaní produktov' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'products:edit')) return forbidden()

    const body = await request.json()
    const parsed = createProductSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Neplatné dáta', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data
    const slug = data.slug?.trim() || generateSlug(data.name)

    // Check for duplicate slug
    const existing = await db.product.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'Produkt s týmto slugom už existuje' },
        { status: 409 }
      )
    }

    const product = await db.product.create({
      data: {
        name: data.name,
        slug,
        shortDesc: data.shortDesc || null,
        description: data.description || null,
        category: data.category,
        specs: data.specs || null,
        benefits: data.benefits || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        status: data.status,
        sortOrder: data.sortOrder,
        imageUrl: data.imageUrl || null,
        galleryImages: data.galleryImages || null,
        suitableFor: data.suitableFor || null,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Chyba pri vytváraní produktu:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri vytváraní produktu' },
      { status: 500 }
    )
  }
}
