import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'
import { z } from 'zod'

const updateReferenceSchema = z.object({
  title: z.string().min(1, 'Názov referencie je povinný').max(300, 'Názov je príliš dlhý').optional(),
  description: z.string().optional(),
  type: z.string().min(1, 'Typ referencie je povinný').optional(),
  location: z.string().min(1, 'Lokalita je povinná').max(200, 'Lokalita je príliš dlhá').optional(),
  system: z.string().max(200, 'Systém je príliš dlhý').optional(),
  coverImage: z.string().url('Neplatná URL adresa obrázka').optional().or(z.literal('')),
  tags: z.string().max(500, 'Tagy sú príliš dlhé').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  sortOrder: z.number().int().optional(),
})

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'references:view')) return forbidden()

    const { id } = await context.params
    const reference = await db.reference.findUnique({ where: { id } })
    if (!reference) {
      return NextResponse.json({ error: 'Referencia nebola nájdená' }, { status: 404 })
    }

    return NextResponse.json(reference)
  } catch (error) {
    console.error('Chyba pri načítavaní referencie:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítavaní referencie' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'references:edit')) return forbidden()

    const { id } = await context.params
    const existing = await db.reference.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Referencia nebola nájdená' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateReferenceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Neplatné dáta', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    const reference = await db.reference.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.system !== undefined && { system: data.system || null }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage || null }),
        ...(data.tags !== undefined && { tags: data.tags || null }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    })

    return NextResponse.json(reference)
  } catch (error) {
    console.error('Chyba pri aktualizácii referencie:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri aktualizácii referencie' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'references:edit')) return forbidden()

    const { id } = await context.params
    const existing = await db.reference.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Referencia nebola nájdená' }, { status: 404 })
    }

    await db.reference.delete({ where: { id } })
    return NextResponse.json({ message: 'Referencia bola úspešne odstránená' })
  } catch (error) {
    console.error('Chyba pri odstraňovaní referencie:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri odstraňovaní referencie' },
      { status: 500 }
    )
  }
}
