import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'

const DEFAULT_AUTOMATIONS = [
  {
    name: 'Nový lead → auto-priradenie',
    description:
      'Automaticky priradí nový lead obchodníkovi podľa round-robin stratégie.',
    trigger: 'lead_created',
    conditions: {},
    actions: [{ type: 'assign', strategy: 'round_robin' }],
    isActive: true,
  },
  {
    name: 'Kontakt → kvalifikácia',
    description:
      'Odošle notifikáciu pri zmene statusu leadu z Nový na Kontaktovaný.',
    trigger: 'status_change',
    conditions: { fromStatus: 'NEW', toStatus: 'CONTACTED' },
    actions: [{ type: 'notify' }],
    isActive: true,
  },
]

// POST /api/admin/automations/seed – Seed default automations
export async function POST() {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'settings:users')) return forbidden()

    const created: string[] = []
    const skipped: string[] = []

    for (const automation of DEFAULT_AUTOMATIONS) {
      const existing = await db.automation.findUnique({
        where: { name: automation.name },
      })

      if (existing) {
        skipped.push(automation.name)
        continue
      }

      await db.automation.create({
        data: {
          name: automation.name,
          description: automation.description,
          trigger: automation.trigger,
          conditions: JSON.stringify(automation.conditions),
          actions: JSON.stringify(automation.actions),
          isActive: automation.isActive,
        },
      })
      created.push(automation.name)
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
    })
  } catch (error) {
    console.error('[AUTOMATIONS SEED] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri seedovaní automatizácií' },
      { status: 500 },
    )
  }
}
