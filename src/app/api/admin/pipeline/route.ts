import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'

// GET /api/admin/pipeline – Return all leads grouped by status for pipeline view
export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'pipeline:view')) return forbidden()

    const leads = await db.lead.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        customerType: true,
        projectType: true,
        priority: true,
        status: true,
        reminderAt: true,
        createdAt: true,
        updatedAt: true,
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    })

    const columns: Record<string, typeof leads> = {
      NEW: [],
      CONTACTED: [],
      QUALIFIED: [],
      PROPOSAL: [],
      NEGOTIATION: [],
      WON: [],
      LOST: [],
    }

    for (const lead of leads) {
      const status = lead.status
      if (columns[status]) {
        columns[status].push(lead)
      }
    }

    return NextResponse.json({ columns })
  } catch (error) {
    console.error('[PIPELINE GET] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní pipeline' },
      { status: 500 }
    )
  }
}
