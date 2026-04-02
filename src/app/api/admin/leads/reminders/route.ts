import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'

// GET /api/admin/leads/reminders – Return leads with upcoming reminders (within 24h)
export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'leads:view')) return forbidden()

    const now = new Date()
    const threshold = new Date(now.getTime() + 24 * 60 * 60 * 1000) // now + 24 hours

    const reminders = await db.lead.findMany({
      where: {
        reminderAt: {
          not: null,
          lte: threshold,
          gte: now,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        reminderAt: true,
        assignedTo: {
          select: { name: true },
        },
      },
      orderBy: { reminderAt: 'asc' },
    })

    return NextResponse.json({ reminders })
  } catch (error) {
    console.error('[REMINDERS GET] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní pripomienok' },
      { status: 500 }
    )
  }
}
