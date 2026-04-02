import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

// GET /api/admin/superadmin/clients – List all clients (non-SUPERADMIN users)
export async function GET() {
  try {
    const authResult = await requireAuth('superadmin:clients')()
    if (!authResult || 'status' in authResult) return authResult

    // Get all users except SUPERADMIN
    const clients = await db.user.findMany({
      where: {
        role: { not: 'SUPERADMIN' },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        clientModules: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Enrich with module counts
    const clientsWithCounts = clients.map((client) => {
      const activeModules = client.clientModules.filter(
        (cm) => cm.status === 'active' || cm.status === 'trial',
      ).length
      const totalModules = client.clientModules.length

      return {
        id: client.id,
        email: client.email,
        name: client.name,
        role: client.role,
        isActive: client.isActive,
        lastLoginAt: client.lastLoginAt,
        activeModuleCount: activeModules,
        totalModules,
      }
    })

    return NextResponse.json({ clients: clientsWithCounts })
  } catch (error) {
    console.error('[SUPERADMIN CLIENTS GET] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní klientov' },
      { status: 500 },
    )
  }
}
