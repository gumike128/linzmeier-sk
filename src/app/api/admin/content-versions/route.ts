import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'
import { z } from 'zod'

const createVersionSchema = z.object({
  action: z.literal('create'),
  entityType: z.enum(['product', 'blog_post']),
  entityId: z.string().min(1),
  changeNote: z.string().max(500).optional(),
})

const rollbackVersionSchema = z.object({
  action: z.literal('rollback'),
  entityType: z.enum(['product', 'blog_post']),
  entityId: z.string().min(1),
  versionId: z.string().min(1),
})

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()

    const { searchParams } = new URL(req.url)
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'Chýba entityType alebo entityId' },
        { status: 400 }
      )
    }

    if (entityType !== 'product' && entityType !== 'blog_post') {
      return NextResponse.json(
        { error: 'Neplatný entityType. Povolené: product, blog_post' },
        { status: 400 }
      )
    }

    const perm = entityType === 'product' ? 'products:view' : 'blog:view'
    if (!hasPermission(user.role, perm)) return forbidden()

    const versions = await db.contentVersion.findMany({
      where: { entityType, entityId },
      orderBy: { version: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    })

    return NextResponse.json({ versions })
  } catch (error) {
    console.error('Chyba pri načítavaní verzií:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítavaní verzií' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()

    const body = await req.json()
    const { action } = body

    // ---------- ROLLBACK ----------
    if (action === 'rollback') {
      const parsed = rollbackVersionSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Neplatné dáta', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        )
      }

      const { entityType, entityId, versionId } = parsed.data

      const perm = entityType === 'product' ? 'products:edit' : 'blog:edit'
      if (!hasPermission(user.role, perm)) return forbidden()

      // Get the target version to rollback to
      const targetVersion = await db.contentVersion.findUnique({
        where: { id: versionId },
      })
      if (!targetVersion) {
        return NextResponse.json(
          { error: 'Verzia nenájdená' },
          { status: 404 }
        )
      }

      // Get current entity to save as auto-version before rollback
      const model = entityType === 'product' ? db.product : db.blogPost
      const current = await (model as typeof db.product).findUnique({
        where: { id: entityId },
      })
      if (!current) {
        return NextResponse.json(
          { error: 'Entita nenájdená' },
          { status: 404 }
        )
      }

      // Save current state as a new version (auto-snapshot before rollback)
      const maxVersion = await db.contentVersion.count({
        where: { entityType, entityId },
      })

      await db.contentVersion.create({
        data: {
          data: JSON.stringify(current),
          entityType,
          entityId,
          version: maxVersion + 1,
          changeNote: 'Automatická verzia pred rollbackom',
          userId: user.id,
        },
      })

      // Rollback: restore entity with target version data
      const versionData = JSON.parse(targetVersion.data) as Record<string, unknown>
      // Remove auto-generated fields that shouldn't be overwritten
      delete versionData.id
      delete versionData.createdAt
      delete versionData.updatedAt

      await (model as typeof db.product).update({
        where: { id: entityId },
        data: versionData,
      })

      return NextResponse.json({
        success: true,
        message: 'Rollback úspešný',
        rolledBackToVersion: targetVersion.version,
        autoSavedVersion: maxVersion + 1,
      })
    }

    // ---------- CREATE VERSION ----------
    if (action === 'create') {
      const parsed = createVersionSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Neplatné dáta', details: parsed.error.flatten().fieldErrors },
          { status: 400 }
        )
      }

      const { entityType, entityId, changeNote } = parsed.data

      const perm = entityType === 'product' ? 'products:edit' : 'blog:edit'
      if (!hasPermission(user.role, perm)) return forbidden()

      // Fetch current entity data
      const model = entityType === 'product' ? db.product : db.blogPost
      const entity = await (model as typeof db.product).findUnique({
        where: { id: entityId },
      })
      if (!entity) {
        return NextResponse.json(
          { error: 'Entita nenájdená' },
          { status: 404 }
        )
      }

      // Increment version number
      const maxVersion = await db.contentVersion.count({
        where: { entityType, entityId },
      })

      const version = await db.contentVersion.create({
        data: {
          data: JSON.stringify(entity),
          entityType,
          entityId,
          version: maxVersion + 1,
          changeNote: changeNote || 'Nová verzia',
          userId: user.id,
        },
      })

      return NextResponse.json(
        { success: true, version: version.version, id: version.id },
        { status: 201 }
      )
    }

    return NextResponse.json(
      { error: 'Neznáma akcia. Povolené: create, rollback' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Chyba pri spracovaní verzie:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri spracovaní verzie' },
      { status: 500 }
    )
  }
}
