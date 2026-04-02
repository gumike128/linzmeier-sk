import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'

// GET /api/admin/audit-log – List audit log entries
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'settings:view')) return forbidden()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const entityType = searchParams.get('entityType') || undefined
    const userId = searchParams.get('userId') || undefined
    const action = searchParams.get('action') || undefined
    const search = searchParams.get('search') || undefined
    const period = searchParams.get('period') || undefined

    const where: Record<string, unknown> = {}

    if (entityType) where.entityType = entityType
    if (userId) where.userId = userId
    if (action) where.action = action
    if (search) {
      where.OR = [
        { details: { contains: search } },
        { action: { contains: search } },
        { entityType: { contains: search } },
      ]
    }
    if (period) {
      const days = parseInt(period)
      const since = new Date()
      since.setDate(since.getDate() - days)
      where.createdAt = { gte: since }
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ])

    return NextResponse.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[AUDIT LOG] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítaní audit logu' },
      { status: 500 },
    )
  }
}

// POST /api/admin/audit-log – Create audit log entry (used internally)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()

    const body = await request.json()
    const { action, entityType, entityId, details, ipAddress } = body

    if (!action || !entityType) {
      return NextResponse.json(
        { error: 'Chýba: action a entityType sú povinné' },
        { status: 400 },
      )
    }

    const log = await db.auditLog.create({
      data: {
        userId: user.id,
        action,
        entityType,
        entityId: entityId || null,
        details: details ? JSON.stringify(details) : null,
        ipAddress:
          ipAddress ||
          request.headers.get('x-forwarded-for') ||
          null,
      },
    })

    return NextResponse.json({ success: true, id: log.id })
  } catch (error) {
    console.error('[AUDIT LOG POST] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri vytváraní audit logu' },
      { status: 500 },
    )
  }
}
