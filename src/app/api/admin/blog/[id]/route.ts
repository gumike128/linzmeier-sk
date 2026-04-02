import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'
import { z } from 'zod'

const updateBlogSchema = z.object({
  title: z.string().min(1, 'Názov článku je povinný').max(300, 'Názov je príliš dlhý').optional(),
  slug: z.string().max(200, 'Slug je príliš dlhý').optional(),
  content: z.string().optional(),
  excerpt: z.string().max(500, 'Perex je príliš dlhý').optional(),
  coverImage: z.string().url('Neplatná URL adresa obrázka').optional().or(z.literal('')),
  category: z.string().max(100, 'Kategória je príliš dlhá').optional(),
  tags: z.string().max(1000, 'Tagy sú príliš dlhé').optional(),
  metaTitle: z.string().max(70, 'Meta title je príliš dlhý').optional(),
  metaDescription: z.string().max(160, 'Meta description je príliš dlhý').optional(),
  metaKeywords: z.string().max(200, 'Meta kľúčové slová sú príliš dlhé').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  publishedAt: z.string().datetime().optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
})

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9áäčďéěíĺľňóôŕšťúůýž]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'blog:view')) return forbidden()

    const { id } = await context.params
    const post = await db.blogPost.findUnique({ where: { id } })
    if (!post) {
      return NextResponse.json({ error: 'Článok nebol nájdený' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Chyba pri načítavaní článku:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítavaní článku' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'blog:edit')) return forbidden()

    const { id } = await context.params
    const existing = await db.blogPost.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Článok nebol nájdený' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = updateBlogSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Neplatné dáta', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Auto-generate slug if title changed and no explicit slug provided
    let slug = data.slug || undefined
    if (data.title && data.title !== existing.title && !data.slug) {
      slug = generateSlug(data.title)
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existing.slug) {
      const slugExists = await db.blogPost.findFirst({ where: { slug, NOT: { id } } })
      if (slugExists) {
        return NextResponse.json(
          { error: 'Článok s týmto slugom už existuje' },
          { status: 409 }
        )
      }
    }

    // Handle publishedAt logic
    let publishedAt = existing.publishedAt
    if (data.publishedAt !== undefined) {
      publishedAt = data.publishedAt ? new Date(data.publishedAt) : null
    } else if (data.status === 'PUBLISHED' && !existing.publishedAt) {
      publishedAt = new Date()
    }

    // Handle scheduled publishing
    let scheduledAt: Date | null | undefined = undefined
    let finalStatus = data.status || existing.status

    if (data.scheduledAt !== undefined) {
      const parsedScheduled = data.scheduledAt ? new Date(data.scheduledAt) : null
      if (parsedScheduled && parsedScheduled > new Date()) {
        // Future date: keep as DRAFT with scheduledAt
        scheduledAt = parsedScheduled
        if (data.status !== 'ARCHIVED') {
          finalStatus = 'DRAFT'
        }
      } else if (parsedScheduled && parsedScheduled <= new Date()) {
        // Past or now: publish immediately
        scheduledAt = null
        publishedAt = parsedScheduled
        finalStatus = 'PUBLISHED'
      } else {
        // Null: clear scheduling
        scheduledAt = null
      }
    } else if (data.status === 'PUBLISHED' && existing.scheduledAt) {
      // If publishing and there was a scheduled date, clear it
      scheduledAt = null
      if (!publishedAt) publishedAt = new Date()
    }

    const updateData: Record<string, unknown> = {
      ...(data.title !== undefined && { title: data.title }),
      ...(slug !== undefined && { slug }),
      ...(data.content !== undefined && { content: data.content || null }),
      ...(data.excerpt !== undefined && { excerpt: data.excerpt || null }),
      ...(data.coverImage !== undefined && { coverImage: data.coverImage || null }),
      ...(data.category !== undefined && { category: data.category || null }),
      ...(data.tags !== undefined && { tags: data.tags || null }),
      ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle || null }),
      ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription || null }),
      ...(data.metaKeywords !== undefined && { metaKeywords: data.metaKeywords || null }),
      status: finalStatus,
      publishedAt,
    }
    if (scheduledAt !== undefined) {
      updateData.scheduledAt = scheduledAt
    }

    const post = await db.blogPost.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error('Chyba pri aktualizácii článku:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri aktualizácii článku' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'blog:edit')) return forbidden()

    const { id } = await context.params
    const existing = await db.blogPost.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Článok nebol nájdený' }, { status: 404 })
    }

    await db.blogPost.delete({ where: { id } })
    return NextResponse.json({ message: 'Článok bol úspešne odstránený' })
  } catch (error) {
    console.error('Chyba pri odstraňovaní článku:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri odstraňovaní článku' },
      { status: 500 }
    )
  }
}
