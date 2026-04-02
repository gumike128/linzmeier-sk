import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuthUser, unauthorized, forbidden } from '@/lib/api-auth'
import { hasPermission } from '@/lib/rbac'

const automationCreateSchema = z.object({
  name: z.string().min(1, 'Názov je povinný').max(200),
  description: z.string().max(500).optional().or(z.literal('')),
  trigger: z.enum(['lead_created', 'status_change']),
  conditions: z
    .object({
      fromStatus: z.string().optional(),
      toStatus: z.string().optional(),
      customerType: z.string().optional(),
    })
    .optional()
    .default({}),
  actions: z
    .array(
      z.object({
        type: z.enum(['email', 'assign', 'notify']),
        template: z.string().optional(),
        strategy: z.string().optional(),
        assignTo: z.string().optional(),
      }),
    )
    .min(1, 'Musíte pridať aspoň jednu akciu'),
  isActive: z.boolean().optional().default(true),
})

// GET /api/admin/automations – List all automations
export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'settings:view')) return forbidden()

    const automations = await db.automation.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ automations })
  } catch (error) {
    console.error('[AUTOMATIONS GET] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri načítavaní automatizácií' },
      { status: 500 },
    )
  }
}

// POST /api/admin/automations – Create automation
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return unauthorized()
    if (!hasPermission(user.role, 'settings:users')) return forbidden()

    const body = await request.json()
    const parsed = automationCreateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      return NextResponse.json(
        { error: 'Chyba validácie', fields: errors },
        { status: 400 },
      )
    }

    const data = parsed.data

    // Check for duplicate name
    const existing = await db.automation.findUnique({
      where: { name: data.name },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Automatizácia s týmto názvom už existuje' },
        { status: 409 },
      )
    }

    const automation = await db.automation.create({
      data: {
        name: data.name,
        description: data.description || null,
        trigger: data.trigger,
        conditions: JSON.stringify(data.conditions),
        actions: JSON.stringify(data.actions),
        isActive: data.isActive,
      },
    })

    return NextResponse.json(automation, { status: 201 })
  } catch (error) {
    console.error('[AUTOMATIONS POST] Error:', error)
    return NextResponse.json(
      { error: 'Nastala chyba pri vytváraní automatizácie' },
      { status: 500 },
    )
  }
}
