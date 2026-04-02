import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'
import { z } from 'zod'

const updateProductSchema = z.object({
  name: z.string().min(1, 'Názov produktu je povinný').max(200, 'Názov je príliš dlhý').optional(),
  slug: z.string().max(200, 'Slug je príliš dlhý').optional(),
  shortDesc: z.string().max(500, 'Krátky popis je príliš dlhý').optional(),
  description: z.string().optional(),
  category: z.string().min(1, 'Kategória je povinná').optional(),
  specs: z.string().optional(),
  benefits: z.string().optional(),
  metaTitle: z.string().max(70, 'Meta title je príliš dlhý').optional(),
  metaDescription: z.string().max(160, 'Meta description je príliš dlhý').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  sortOrder: z.number().int().optional(),
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

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'products:view')) return forbidden()

    const { id } = await context.params
    const product = await db.product.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json({ error: 'Produkt nebol nájdený' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Chyba pri načítavaní produktu:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítavaní produktu' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'products:edit')) return forbidden()

    const { id } = await context.params
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Produkt nebol nájdený' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateProductSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Neplatné dáta', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Auto-generate slug if name changed and no explicit slug provided
    let slug = data.slug || undefined
    if (data.name && data.name !== existing.name && !data.slug) {
      slug = generateSlug(data.name)
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existing.slug) {
      const slugExists = await db.product.findFirst({ where: { slug, NOT: { id } } })
      if (slugExists) {
        return NextResponse.json(
          { error: 'Produkt s týmto slugom už existuje' },
          { status: 409 }
        )
      }
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(slug !== undefined && { slug }),
        ...(data.shortDesc !== undefined && { shortDesc: data.shortDesc || null }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.specs !== undefined && { specs: data.specs || null }),
        ...(data.benefits !== undefined && { benefits: data.benefits || null }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle || null }),
        ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription || null }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
        ...(data.galleryImages !== undefined && { galleryImages: data.galleryImages || null }),
        ...(data.suitableFor !== undefined && { suitableFor: data.suitableFor || null }),
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Chyba pri aktualizácii produktu:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri aktualizácii produktu' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'products:edit')) return forbidden()

    const { id } = await context.params
    const existing = await db.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Produkt nebol nájdený' }, { status: 404 })
    }

    await db.product.delete({ where: { id } })
    return NextResponse.json({ message: 'Produkt bol úspešne odstránený' })
  } catch (error) {
    console.error('Chyba pri odstraňovaní produktu:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri odstraňovaní produktu' },
      { status: 500 }
    )
  }
}
