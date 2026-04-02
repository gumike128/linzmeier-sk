import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'
import { z } from 'zod'

const createReferenceSchema = z.object({
  title: z.string().min(1, 'Názov referencie je povinný').max(300, 'Názov je príliš dlhý'),
  description: z.string().optional(),
  type: z.string().min(1, 'Typ referencie je povinný'),
  location: z.string().min(1, 'Lokalita je povinná').max(200, 'Lokalita je príliš dlhá'),
  system: z.string().max(200, 'Systém je príliš dlhý').optional(),
  coverImage: z.string().url('Neplatná URL adresa obrázka').optional().or(z.literal('')),
  tags: z.string().max(500, 'Tagy sú príliš dlhé').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  sortOrder: z.number().int().default(0),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'references:view')) return forbidden()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const type = searchParams.get('type') || undefined
    const search = searchParams.get('search') || undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (type) where.type = type
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { location: { contains: search } },
      ]
    }

    const [references, total] = await Promise.all([
      db.reference.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.reference.count({ where }),
    ])

    return NextResponse.json({
      references,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Chyba pri načítavaní referencií:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítavaní referencií' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'references:edit')) return forbidden()

    const body = await request.json()
    const parsed = createReferenceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Neplatné dáta', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    const reference = await db.reference.create({
      data: {
        title: data.title,
        description: data.description || null,
        type: data.type,
        location: data.location,
        system: data.system || null,
        coverImage: data.coverImage || null,
        tags: data.tags || null,
        status: data.status,
        sortOrder: data.sortOrder,
      },
    })

    return NextResponse.json(reference, { status: 201 })
  } catch (error) {
    console.error('Chyba pri vytváraní referencie:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri vytváraní referencie' },
      { status: 500 }
    )
  }
}
