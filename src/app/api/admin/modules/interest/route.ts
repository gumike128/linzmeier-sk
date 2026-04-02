import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'

const interestSchema = z.object({
  moduleId: z.string().min(1, 'ID modulu je povinné'),
  message: z.string().max(1000, 'Správa nesmie presiahnuť 1000 znakov').optional(),
})

// POST /api/admin/modules/interest – Submit interest in a module
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth('modules:view')()
    if (!authResult || 'status' in authResult) return authResult

    const user = authResult

    const body = await request.json()
    const parsed = interestSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { error: 'Chyba validácie', fields: errors },
        { status: 400 },
      )
    }

    const { moduleId, message } = parsed.data

    // Verify module exists
    const moduleRecord = await db.module.findUnique({
      where: { id: moduleId },
      select: { id: true, name: true },
    })

    if (!moduleRecord) {
      return NextResponse.json(
        { error: 'Modul nebol nájdený' },
        { status: 404 },
      )
    }

    // Create audit log entry for the interest
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'module_interest',
        entityType: 'module',
        entityId: moduleId,
        details: JSON.stringify({
          moduleName: moduleRecord.name,
          userName: user.name,
          userEmail: user.email,
          message: message || null,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Žiadosť bola odoslaná',
    })
  } catch (error) {
    console.error('[MODULES INTEREST POST] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri odosielaní žiadosti' },
      { status: 500 },
    )
  }
}
