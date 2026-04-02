import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { isSuperAdmin } from '@/lib/rbac'

// GET /api/admin/modules – List all visible modules for current client
export async function GET() {
  try {
    const authResult = await requireAuth('modules:view')()
    if (!authResult || 'status' in authResult) return authResult

    const user = authResult

    // Fetch all visible modules ordered by sortOrder
    const modules = await db.module.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        clientModules: {
          where: { clientId: user.id },
        },
      },
    })

    // Parse JSON strings and attach client module status
    const modulesWithStatus = modules.map((mod) => {
      let linkedMenuItems: string[] = []
      let features: string[] = []

      try {
        if (mod.linkedMenuItems) {
          linkedMenuItems = JSON.parse(mod.linkedMenuItems)
        }
      } catch {
        linkedMenuItems = []
      }

      try {
        if (mod.features) {
          features = JSON.parse(mod.features)
        }
      } catch {
        features = []
      }

      return {
        id: mod.id,
        slug: mod.slug,
        name: mod.name,
        description: mod.description,
        longDescription: mod.longDescription,
        category: mod.category,
        icon: mod.icon,
        price: mod.price,
        priceLabel: mod.priceLabel,
        sortOrder: mod.sortOrder,
        isVisible: mod.isVisible,
        isFree: mod.isFree,
        trialDays: mod.trialDays,
        linkedMenuItems,
        features,
        createdAt: mod.createdAt,
        updatedAt: mod.updatedAt,
        _clientModule: mod.clientModules[0] ?? null,
      }
    })

    return NextResponse.json({
      modules: modulesWithStatus,
      ...(isSuperAdmin(user.role) && { isSuperAdmin: true }),
    })
  } catch (error) {
    console.error('[MODULES GET] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní modulov' },
      { status: 500 },
    )
  }
}
