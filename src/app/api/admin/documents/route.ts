import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'
import { z } from 'zod'

const createDocumentSchema = z.object({
  title: z.string().min(1, 'Názov dokumentu je povinný').max(300, 'Názov je príliš dlhý'),
  description: z.string().max(500, 'Popis je príliš dlhý').optional(),
  category: z.string().min(1, 'Kategória dokumentu je povinná'),
  fileType: z.string().min(1, 'Typ súboru je povinný'),
  fileSize: z.number().int().positive('Veľkosť súboru musí byť kladné číslo').optional(),
  fileUrl: z.string().min(1, 'URL adresa súboru je povinná'),
  sortOrder: z.number().int().default(0),
  isPublic: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'documents:view')) return forbidden()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    const isPublicParam = searchParams.get('isPublic')
    const isPublic = isPublicParam !== null ? isPublicParam === 'true' : undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (isPublic !== undefined) where.isPublic = isPublic

    const [documents, total] = await Promise.all([
      db.document.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.document.count({ where }),
    ])

    return NextResponse.json({
      documents,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Chyba pri načítavaní dokumentov:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítavaní dokumentov' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'documents:upload')) return forbidden()

    const body = await request.json()
    const parsed = createDocumentSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Neplatné dáta', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    const document = await db.document.create({
      data: {
        title: data.title,
        description: data.description || null,
        category: data.category,
        fileType: data.fileType,
        fileSize: data.fileSize || null,
        fileUrl: data.fileUrl,
        sortOrder: data.sortOrder,
        isPublic: data.isPublic,
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Chyba pri vytváraní dokumentu:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri vytváraní dokumentu' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'documents:edit')) return forbidden()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Chýba ID dokumentu' },
        { status: 400 }
      )
    }

    const existing = await db.document.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Dokument nebol nájdený' }, { status: 404 })
    }

    await db.document.delete({ where: { id } })
    return NextResponse.json({ message: 'Dokument bol úspešne odstránený' })
  } catch (error) {
    console.error('Chyba pri odstraňovaní dokumentu:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri odstraňovaní dokumentu' },
      { status: 500 }
    )
  }
}
