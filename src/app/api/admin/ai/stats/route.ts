import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

export async function GET() {
  try {
    const authResult = await requireAuth('ai:generate')()
    if (!authResult || 'status' in authResult) return authResult

    const [total, byTypeRaw, recentInteractions] = await Promise.all([
      /* Total count */
      db.aIInteraction.count(),

      /* Count by type */
      db.aIInteraction.groupBy({
        by: ['type'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),

      /* Last 20 interactions with user name */
      db.aIInteraction.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          input: true,
          model: true,
          durationMs: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      }),
    ])

    const byType: Record<string, number> = {}
    for (const item of byTypeRaw) {
      byType[item.type] = item._count.id
    }

    /* Average duration */
    const avgDuration = await db.aIInteraction.aggregate({
      _avg: { durationMs: true },
      where: { durationMs: { not: null } },
    })

    return NextResponse.json({
      total,
      byType,
      avgDurationMs: Math.round(avgDuration._avg.durationMs ?? 0),
      recentInteractions,
    })
  } catch (error) {
    console.error('[AI Stats API] GET Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítavaní AI štatistík' },
      { status: 500 },
    )
  }
}
