import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'
import { z } from 'zod'

const BLOG_CATEGORIES = [
  'Fasáda',
  'Zateplenie',
  'Produkty',
  'Montáž',
  'Energetika',
  'Normy a certifikácie',
  'Spoločnosť',
] as const

const createBlogSchema = z.object({
  title: z.string().min(1, 'Názov článku je povinný').max(300, 'Názov je príliš dlhý'),
  slug: z.string().max(200, 'Slug je príliš dlhý').optional(),
  content: z.string().optional(),
  excerpt: z.string().max(500, 'Perex je príliš dlhý').optional(),
  coverImage: z.string().url('Neplatná URL adresa obrázka').optional().or(z.literal('')),
  category: z.string().max(100, 'Kategória je príliš dlhá').optional(),
  tags: z.string().max(1000, 'Tagy sú príliš dlhé').optional(),
  metaTitle: z.string().max(70, 'Meta title je príliš dlhý').optional(),
  metaDescription: z.string().max(160, 'Meta description je príliš dlhý').optional(),
  metaKeywords: z.string().max(200, 'Meta kľúčové slová sú príliš dlhé').optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  publishedAt: z.string().datetime().optional(),
  scheduledAt: z.string().datetime().optional(),
})

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9áäčďéěíĺľňóôŕšťúůýž]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'blog:view')) return forbidden()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

    const category = searchParams.get('category') || undefined

    const where: Record<string, unknown> = {}
    if (status) where.status = status
    if (category) where.category = category
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ]
    }

    const [posts, total] = await Promise.all([
      db.blogPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.blogPost.count({ where }),
    ])

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Chyba pri načítavaní článkov:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítavaní článkov' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'blog:edit')) return forbidden()

    const body = await request.json()
    const parsed = createBlogSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Neplatné dáta', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const data = parsed.data
    const slug = data.slug?.trim() || generateSlug(data.title)

    // Check for duplicate slug
    const existing = await db.blogPost.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'Článok s týmto slugom už existuje' },
        { status: 409 }
      )
    }

    // Handle scheduled publishing
    let scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null
    let finalStatus = data.status

    // If scheduledAt is in the future, keep as DRAFT and store scheduledAt
    if (scheduledAt && scheduledAt > new Date()) {
      finalStatus = 'DRAFT'
    }

    // Auto-set publishedAt if publishing without a date
    let publishedAt = data.publishedAt ? new Date(data.publishedAt) : null
    if (finalStatus === 'PUBLISHED' && !publishedAt) {
      publishedAt = new Date()
    }

    // If scheduled and status is PUBLISHED, set publishedAt = scheduledAt
    if (scheduledAt && data.status === 'PUBLISHED') {
      publishedAt = scheduledAt
      scheduledAt = null
      finalStatus = 'PUBLISHED'
    }

    const post = await db.blogPost.create({
      data: {
        title: data.title,
        slug,
        content: data.content || null,
        excerpt: data.excerpt || null,
        coverImage: data.coverImage || null,
        category: data.category || null,
        tags: data.tags || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        metaKeywords: data.metaKeywords || null,
        status: finalStatus,
        publishedAt,
        scheduledAt,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Chyba pri vytváraní článku:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri vytváraní článku' },
      { status: 500 }
    )
  }
}
